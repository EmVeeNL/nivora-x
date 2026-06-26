<?php

declare( strict_types=1 );

namespace NivoraX\Render\Elements;

use NivoraX\Render\ElementRendererInterface;
use NivoraX\Render\RendererRegistry;
use NivoraX\Render\TreeRenderer;
use NivoraX\Storage\DocumentStore;
use NivoraX\Templates\TemplatePostType;

defined( 'ABSPATH' ) || exit;

/**
 * Renders the `part` element — an embed-by-reference template part.
 *
 * The node stores `props.templateId`; this renderer resolves that template's
 * document at render time and inlines it, so edits to the referenced template
 * propagate to every embed (the reference is never copied). A static render
 * stack guards against recursive embedding (a part that embeds an ancestor).
 * Missing / invalid references fail safe with an HTML comment instead of fataling.
 */
final class PartRenderer implements ElementRendererInterface {

	/**
	 * Template ids currently being resolved, innermost last. A template id that
	 * is already on the stack indicates a cycle.
	 *
	 * @var list<int>
	 */
	private static array $stack = [];

	/**
	 * Resolve and inline the referenced template.
	 *
	 * @param object           $node          Decoded part node.
	 * @param string           $children_html Pre-rendered children (unused — parts have no children).
	 * @param RendererRegistry $registry      Registry used to render the resolved template tree.
	 * @return string Escaped HTML fragment, or a safe comment when unavailable.
	 */
	public function render( object $node, string $children_html, RendererRegistry $registry ): string { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		$id          = esc_attr( (string) ( $node->id ?? '' ) );
		$template_id = isset( $node->props->templateId ) ? (int) $node->props->templateId : 0; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

		if ( $template_id <= 0 ) {
			return self::notice( 'no template selected' );
		}

		if ( in_array( $template_id, self::$stack, true ) ) {
			return self::notice( sprintf( 'cycle detected for template #%d', $template_id ) );
		}

		if ( TemplatePostType::POST_TYPE !== get_post_type( $template_id ) ) {
			return self::notice( sprintf( 'template #%d not found', $template_id ) );
		}

		$tree = DocumentStore::read( $template_id )->tree;
		if ( ! is_object( $tree ) ) {
			return self::notice( sprintf( 'template #%d is empty', $template_id ) );
		}

		self::$stack[] = $template_id;
		$inner         = ( new TreeRenderer( $registry ) )->render( $tree );
		array_pop( self::$stack );

		return sprintf(
			'<div class="nivorax-%s" data-node-id="%s" data-nivorax-part="%d">%s</div>',
			$id,
			$id,
			$template_id,
			$inner
		);
	}

	/**
	 * A safe, non-fataling placeholder for unresolved references.
	 *
	 * @param string $reason Human-readable reason (developer-facing only).
	 * @return string HTML comment.
	 */
	private static function notice( string $reason ): string {
		return sprintf( '<!-- nivorax-part: %s -->', esc_html( $reason ) );
	}
}
