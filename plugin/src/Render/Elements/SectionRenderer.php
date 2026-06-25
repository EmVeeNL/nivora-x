<?php

declare( strict_types=1 );

namespace NivoraX\Render\Elements;

use NivoraX\Render\ElementRendererInterface;
use NivoraX\Render\RendererRegistry;

defined( 'ABSPATH' ) || exit;

/**
 * Renders the `section` element type.
 *
 * Matches the React SectionElement: a full-width `<section>` with default
 * layout styles. The scoped `.nivorax-{id}` class is the CSS-engine hook.
 */
final class SectionRenderer implements ElementRendererInterface {

	/**
	 * Default inline styles mirroring the React SectionElement definition.
	 */
	private const DEFAULT_STYLE = 'display:block;width:100%;min-height:80px;box-sizing:border-box;padding:24px 0';

	/**
	 * Render a section node to an escaped HTML string.
	 *
	 * @param object           $node          Decoded node.
	 * @param string           $children_html Pre-rendered children HTML.
	 * @param RendererRegistry $registry      Renderer registry (unused; required by interface).
	 * @return string Escaped HTML fragment.
	 */
	public function render( object $node, string $children_html, RendererRegistry $registry ): string { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		$id      = esc_attr( (string) ( $node->id ?? '' ) );
		$html_id = isset( $node->props->htmlId ) ? esc_attr( (string) $node->props->htmlId ) : ''; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

		$id_attr = '' !== $html_id ? sprintf( ' id="%s"', $html_id ) : '';

		return sprintf(
			'<section class="nivorax-%s" data-node-id="%s"%s style="%s">%s</section>',
			$id,
			$id,
			$id_attr,
			self::DEFAULT_STYLE,
			$children_html
		);
	}
}
