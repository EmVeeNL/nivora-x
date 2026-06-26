<?php

declare( strict_types=1 );

use Brain\Monkey\Functions;
use NivoraX\Editor\Bootstrap;
use NivoraX\Templates\TemplatePostType;

describe(
	'Bootstrap template context',
	function (): void {

		beforeEach(
			function (): void {
				Functions\when( 'esc_url_raw' )->returnArg();
				Functions\when( 'rest_url' )->justReturn( 'https://example.test/wp-json/' );
				Functions\when( 'wp_create_nonce' )->justReturn( 'nonce' );
				Functions\when( 'admin_url' )->justReturn( 'https://example.test/wp-admin/' );
				Functions\when( 'home_url' )->justReturn( 'https://example.test/' );
				Functions\when( 'get_bloginfo' )->justReturn( 'Example' );
				Functions\when( 'get_the_title' )->justReturn( 'My Template' );
				Functions\when( 'current_user_can' )->justReturn( true );
				Functions\when( 'get_option' )->justReturn( [ 'breakpoints' => [] ] );
				Functions\when( '__' )->returnArg();
				Functions\when( 'sanitize_key' )->returnArg();
				Functions\when( 'sanitize_text_field' )->returnArg();
				Functions\when( 'absint' )->alias( static fn( $v ): int => (int) $v );
			}
		);

		it(
			'returns a null template context for regular pages',
			function (): void {
				Functions\when( 'get_post_type' )->justReturn( 'page' );

				$data = Bootstrap::data( 5, 'nivorax' );
				expect( $data['template'] )->toBeNull();
			}
		);

		it(
			'returns the template type when editing a template post',
			function (): void {
				Functions\when( 'get_post_type' )->justReturn( TemplatePostType::POST_TYPE );
				Functions\when( 'get_post_meta' )->justReturn( 'header' );

				$data = Bootstrap::data( 5, 'nivorax' );
				expect( $data['template'] )->toBe( [ 'type' => 'header' ] );
			}
		);
	}
);
