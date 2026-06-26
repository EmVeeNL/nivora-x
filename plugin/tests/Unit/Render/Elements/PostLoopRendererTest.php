<?php

declare( strict_types=1 );

use Brain\Monkey\Functions;
use NivoraX\Render\Elements\PostLoopRenderer;
use NivoraX\Render\RendererRegistry;

/**
 * A post-loop node.
 */
function nivorax_loop_node(): object {
	return (object) [
		'id'   => 'loop1',
		'type' => 'post-loop',
	];
}

describe(
	'PostLoopRenderer',
	function (): void {

		beforeEach(
			function (): void {
				Functions\when( 'esc_attr' )->returnArg();
			}
		);

		afterEach(
			function (): void {
				unset( $GLOBALS['wp_query'] );
			}
		);

		it(
			'repeats the loop item once per post in the main query',
			function (): void {
				// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
				$GLOBALS['wp_query'] = (object) [ 'posts' => [ 1, 2, 3 ] ];

				$html = ( new PostLoopRenderer() )->render( nivorax_loop_node(), '<span>ITEM</span>', new RendererRegistry() );

				expect( substr_count( $html, 'nivorax-loop-item' ) )->toBe( 3 )
				->and( substr_count( $html, 'ITEM' ) )->toBe( 3 )
				->and( $html )->toContain( 'data-nivorax-loop="post"' );
			}
		);

		it(
			'renders an empty loop wrapper when the query has no posts',
			function (): void {
				// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
				$GLOBALS['wp_query'] = (object) [ 'posts' => [] ];

				$html = ( new PostLoopRenderer() )->render( nivorax_loop_node(), '<span>ITEM</span>', new RendererRegistry() );

				expect( $html )->not->toContain( 'nivorax-loop-item' )
				->and( $html )->toContain( 'data-nivorax-loop="post"' );
			}
		);
	}
);
