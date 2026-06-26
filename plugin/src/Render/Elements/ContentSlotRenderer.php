<?php

declare( strict_types=1 );

namespace NivoraX\Render\Elements;

use NivoraX\Editor\EditorMode;
use NivoraX\Render\ElementRendererInterface;
use NivoraX\Render\RendererRegistry;
use NivoraX\Render\TreeRenderer;
use NivoraX\Storage\DocumentStore;

defined( 'ABSPATH' ) || exit;

/**
 * Renders the `content-slot` element — the place a single template injects the
 * current post's body.
 *
 * If the queried post is itself built with NivoraX, its document tree renders
 * via the Phase 10 renderer; otherwise the post's `post_content` runs through
 * `the_content` so shortcodes/embeds behave as on a normal theme. Full dynamic
 * field binding is Phase 14 — this is the structural slot only.
 */
final class ContentSlotRenderer implements ElementRendererInterface {

	/**
	 * Render the current post's content into the slot.
	 *
	 * @param object           $node          Decoded content-slot node.
	 * @param string           $children_html Pre-rendered children (unused — the slot has none).
	 * @param RendererRegistry $registry      Registry used to render NivoraX post content.
	 * @return string Escaped HTML fragment.
	 */
	public function render( object $node, string $children_html, RendererRegistry $registry ): string { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		$id      = esc_attr( (string) ( $node->id ?? '' ) );
		$post_id = get_the_ID();
		$inner   = '';

		if ( is_int( $post_id ) && $post_id > 0 ) {
			$inner = $this->render_post_content( $post_id, $registry );
		}

		return sprintf(
			'<div class="nivorax-%s" data-node-id="%s" data-nivorax-slot="content">%s</div>',
			$id,
			$id,
			$inner
		);
	}

	/**
	 * Resolve a post's body: NivoraX document when present, else `the_content`.
	 *
	 * @param int              $post_id  Queried post id.
	 * @param RendererRegistry $registry Registry for NivoraX content rendering.
	 * @return string HTML.
	 */
	private function render_post_content( int $post_id, RendererRegistry $registry ): string {
		if ( EditorMode::is_nivorax( $post_id ) ) {
			$tree = DocumentStore::read( $post_id )->tree;
			if ( is_object( $tree ) ) {
				return ( new TreeRenderer( $registry ) )->render( $tree );
			}
			return '';
		}

		$post = get_post( $post_id );
		if ( ! $post instanceof \WP_Post ) {
			return '';
		}

		return wp_kses_post( apply_filters( 'the_content', $post->post_content ) );
	}
}
