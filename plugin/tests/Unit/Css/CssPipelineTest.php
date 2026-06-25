<?php

declare( strict_types=1 );

namespace NivoraX\Tests\Unit\Css;

use Brain\Monkey\Functions;
use NivoraX\Css\CssGenerator;
use NivoraX\Css\CssPipeline;
use NivoraX\Css\CssStoreInterface;

// Default breakpoints used in mocks.
$test_breakpoints = [
	[
		'id'        => 'desktop',
		'label'     => 'Desktop',
		'width'     => 1440,
		'direction' => 'max',
		'builtin'   => true,
	],
	[
		'id'        => 'tablet',
		'label'     => 'Tablet',
		'width'     => 768,
		'direction' => 'max',
		'builtin'   => true,
	],
	[
		'id'        => 'mobile',
		'label'     => 'Mobile',
		'width'     => 375,
		'direction' => 'max',
		'builtin'   => true,
	],
];

describe(
	'CssPipeline',
	function () use ( $test_breakpoints ) {

		beforeEach(
			function () use ( $test_breakpoints ) {
				Functions\when( 'wp_is_post_revision' )->justReturn( false );
				Functions\when( 'wp_is_post_autosave' )->justReturn( false );
				Functions\when( 'get_post_meta' )->justReturn( '' );
				Functions\when( 'is_singular' )->justReturn( false );
				Functions\when( 'get_the_ID' )->justReturn( 0 );
				Functions\when( 'wp_enqueue_style' )->justReturn( null );
				Functions\when( 'wp_register_style' )->justReturn( null );
				Functions\when( 'wp_add_inline_style' )->justReturn( null );
				Functions\when( 'get_option' )->justReturn( false );
				Functions\when( 'sanitize_key' )->returnArg();
				Functions\when( 'sanitize_text_field' )->returnArg();
				Functions\when( 'absint' )->alias( 'abs' );
				Functions\when( 'update_post_meta' )->justReturn( true );

				$this->store    = \Mockery::mock( CssStoreInterface::class );
				$this->pipeline = new CssPipeline( new CssGenerator(), $this->store );
				$this->post     = \Mockery::mock( 'WP_Post' );
			}
		);

		// -------------------------------------------------------------------------
		// register()
		// -------------------------------------------------------------------------

		it(
			'registers save_post_nivorax-page and wp_enqueue_scripts hooks',
			function () {
				$hooks = [];
				Functions\when( 'add_action' )->alias(
					static function ( string $hook ) use ( &$hooks ) {
						$hooks[] = $hook;
					}
				);

				$this->pipeline->register();

				expect( $hooks )->toContain( 'save_post_nivorax-page' );
				expect( $hooks )->toContain( 'wp_enqueue_scripts' );
			}
		);

		// -------------------------------------------------------------------------
		// on_save()
		// -------------------------------------------------------------------------

		it(
			'on_save skips revision posts',
			function () {
				Functions\when( 'wp_is_post_revision' )->justReturn( true );
				$this->store->shouldNotReceive( 'store' );

				$this->pipeline->on_save( 1, $this->post );
				expect( true )->toBeTrue();
			}
		);

		it(
			'on_save skips autosave posts',
			function () {
				Functions\when( 'wp_is_post_autosave' )->justReturn( true );
				$this->store->shouldNotReceive( 'store' );

				$this->pipeline->on_save( 1, $this->post );
				expect( true )->toBeTrue();
			}
		);

		it(
			'on_save skips posts with no document meta',
			function () {
				Functions\when( 'get_post_meta' )->justReturn( '' );
				$this->store->shouldNotReceive( 'store' );

				$this->pipeline->on_save( 1, $this->post );
				expect( true )->toBeTrue();
			}
		);

		it(
			'on_save generates and stores CSS for a valid document',
			function () {
				// Envelope format: { version, tree: { rootId, nodes }, meta }.
				$envelope = [
					'version' => 1,
					'tree'    => [
						'rootId' => 'root',
						'nodes'  => [
							'root' => [
								'id'        => 'root',
								'type'      => 'section',
								'props'     => [ 'color' => 'red' ],
								'children'  => [],
								'overrides' => (object) [],
							],
						],
					],
					'meta'    => [],
				];

				Functions\when( 'get_post_meta' )->justReturn( (string) json_encode( $envelope ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode

				$this->store->shouldReceive( 'store' )
				->once()
				->withArgs(
					static function ( int $post_id, string $css ): bool {
						return 42 === $post_id && str_contains( $css, '.nivorax-root' );
					}
				)
				->andReturn( 'deadbeef' );

				$this->pipeline->on_save( 42, $this->post );
				expect( true )->toBeTrue(); // Mockery's shouldReceive->once() verified in tearDown.
			}
		);

		// -------------------------------------------------------------------------
		// enqueue()
		// -------------------------------------------------------------------------

		it(
			'enqueue does nothing for non-singular pages',
			function () {
				Functions\when( 'is_singular' )->justReturn( false );

				// No store methods should be called.
				$this->store->shouldNotReceive( 'get_version' );
				$this->store->shouldNotReceive( 'get_url' );
				$this->store->shouldNotReceive( 'get' );

				$this->pipeline->enqueue();

				expect( true )->toBeTrue(); // Mockery shouldNotReceive verified in tearDown.
			}
		);

		it(
			'enqueue adds inline style for meta-fallback CSS',
			function () {
				Functions\when( 'is_singular' )->justReturn( true );
				Functions\when( 'get_the_ID' )->justReturn( 5 );

				$this->store->shouldReceive( 'get_version' )->with( 5 )->andReturn( 'v1' );
				$this->store->shouldReceive( 'get_url' )->with( 5 )->andReturn( null );
				$this->store->shouldReceive( 'get' )->with( 5 )->andReturn( '.nivorax-a{color:red}' );

				$registered_css = null;
				Functions\when( 'wp_register_style' )->justReturn( null );
				Functions\when( 'wp_enqueue_style' )->justReturn( null );
				Functions\when( 'wp_add_inline_style' )->alias(
					static function ( string $handle, string $css ) use ( &$registered_css ) {
						$registered_css = $css;
					}
				);

				$this->pipeline->enqueue();

				expect( $registered_css )->toContain( '.nivorax-a' );
			}
		);

		it(
			'enqueue uses file URL when available',
			function () {
				Functions\when( 'is_singular' )->justReturn( true );
				Functions\when( 'get_the_ID' )->justReturn( 7 );

				$this->store->shouldReceive( 'get_version' )->with( 7 )->andReturn( 'abc123' );
				$this->store->shouldReceive( 'get_url' )->with( 7 )->andReturn( 'http://example.com/nivorax-css/7.css' );

				$enqueued_handle = null;
				$enqueued_url    = null;
				$enqueued_ver    = null;
				Functions\when( 'wp_enqueue_style' )->alias(
					static function ( string $handle, string $url = '', array $deps = [], mixed $ver = null ) use ( &$enqueued_handle, &$enqueued_url, &$enqueued_ver ) {
						$enqueued_handle = $handle;
						$enqueued_url    = $url;
						$enqueued_ver    = $ver;
					}
				);

				$this->pipeline->enqueue();

				expect( $enqueued_handle )->toBe( 'nivorax-page-7' );
				expect( $enqueued_url )->toContain( '7.css' );
				expect( $enqueued_ver )->toBe( 'abc123' );
			}
		);
	}
);
