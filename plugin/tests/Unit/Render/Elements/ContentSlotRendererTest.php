<?php

declare( strict_types=1 );

use Brain\Monkey\Functions;
use NivoraX\Render\Elements\ContentSlotRenderer;
use NivoraX\Render\RendererRegistry;

/**
 * A content-slot node.
 */
function nivorax_slot_node(): object {
	return (object) [
		'id'   => 'slot1',
		'type' => 'content-slot',
	];
}

describe(
	'ContentSlotRenderer',
	function (): void {

		beforeEach(
			function (): void {
				Functions\when( 'esc_attr' )->returnArg();
				Functions\when( 'wp_kses_post' )->returnArg();
			}
		);

		it(
			'renders the queried post content via the_content for non-NivoraX posts',
			function (): void {
				Functions\when( 'get_the_ID' )->justReturn( 12 );
				Functions\when( 'get_post_meta' )->justReturn( '' ); // EditorMode -> default.
				$post = new WP_Post( [ 'post_content' => 'HELLO BODY' ] );
				Functions\when( 'get_post' )->justReturn( $post );
				Functions\when( 'apply_filters' )->alias( fn( $hook, $value ) => $value );

				$html = ( new ContentSlotRenderer() )->render( nivorax_slot_node(), '', new RendererRegistry() );

				expect( $html )->toContain( 'HELLO BODY' )
				->and( $html )->toContain( 'data-nivorax-slot="content"' );
			}
		);

		it(
			'renders an empty slot wrapper when there is no current post',
			function (): void {
				Functions\when( 'get_the_ID' )->justReturn( false );

				$html = ( new ContentSlotRenderer() )->render( nivorax_slot_node(), '', new RendererRegistry() );

				expect( $html )->toContain( 'data-nivorax-slot="content"' )
				->and( $html )->not->toContain( 'HELLO' );
			}
		);
	}
);
