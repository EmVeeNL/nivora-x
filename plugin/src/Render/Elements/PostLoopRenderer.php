<?php

declare( strict_types=1 );

namespace NivoraX\Render\Elements;

use NivoraX\Render\ElementRendererInterface;
use NivoraX\Render\RendererRegistry;

defined( 'ABSPATH' ) || exit;

/**
 * Renders the `post-loop` element — archive templates repeat their authored
 * loop-item subtree once per post in the main query.
 *
 * This phase ships a structural loop: the pre-rendered loop-item markup is
 * emitted once per queried post, wrapped in a `.nivorax-loop-item`. Per-post
 * field binding and custom queries arrive in Phase 14.
 */
final class PostLoopRenderer implements ElementRendererInterface {

	/**
	 * Repeat the loop item over the main query's posts.
	 *
	 * @param object           $node          Decoded post-loop node.
	 * @param string           $children_html Pre-rendered loop-item markup.
	 * @param RendererRegistry $registry      Registry (unused; required by interface).
	 * @return string Escaped HTML fragment.
	 */
	public function render( object $node, string $children_html, RendererRegistry $registry ): string { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		$id    = esc_attr( (string) ( $node->id ?? '' ) );
		$count = $this->query_post_count();

		$items = '';
		for ( $i = 0; $i < $count; $i++ ) {
			$items .= sprintf( '<div class="nivorax-loop-item">%s</div>', $children_html );
		}

		return sprintf(
			'<div class="nivorax-%s" data-node-id="%s" data-nivorax-loop="post">%s</div>',
			$id,
			$id,
			$items
		);
	}

	/**
	 * Number of posts in the current main query.
	 *
	 * @return int
	 */
	private function query_post_count(): int {
		$wp_query = $GLOBALS['wp_query'] ?? null;
		if ( is_object( $wp_query ) && isset( $wp_query->posts ) && is_array( $wp_query->posts ) ) {
			return count( $wp_query->posts );
		}
		return 0;
	}
}
