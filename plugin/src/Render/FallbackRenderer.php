<?php

declare( strict_types=1 );

namespace NivoraX\Render;

defined( 'ABSPATH' ) || exit;

/**
 * Safe fallback for unknown element types.
 *
 * Emits an empty, scoped container so the rest of the tree renders without
 * fatals. Children are still rendered to avoid data loss on partial-unknown trees.
 */
final class FallbackRenderer implements ElementRendererInterface {

	/**
	 * Render an unknown element type as a safe, scoped wrapper.
	 *
	 * @param object           $node          Decoded node.
	 * @param string           $children_html Pre-rendered children HTML.
	 * @param RendererRegistry $registry      Renderer registry.
	 * @return string Escaped HTML fragment.
	 */
	public function render( object $node, string $children_html, RendererRegistry $registry ): string {
		$id   = esc_attr( $node->id ?? '' );
		$type = esc_attr( $node->type ?? 'unknown' );

		return sprintf(
			'<div class="nivorax-%s" data-node-id="%s" data-nx-type="%s">%s</div>',
			$id,
			$id,
			$type,
			$children_html
		);
	}
}
