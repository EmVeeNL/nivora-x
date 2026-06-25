<?php

declare( strict_types=1 );

namespace NivoraX\Tests\Unit\Css;

use Brain\Monkey\Functions;
use NivoraX\Css\CssStore;

describe(
	'CssStore',
	function () {

		beforeEach(
			function () {
				// Stub WP functions used by CssStore.
				Functions\when( 'wp_upload_dir' )->justReturn(
					[
						'basedir' => '/tmp/nivorax-uploads',
						'baseurl' => 'http://example.com/wp-content/uploads',
					]
				);
				Functions\when( 'wp_mkdir_p' )->justReturn( true );
				Functions\when( 'update_post_meta' )->justReturn( true );
				Functions\when( 'get_post_meta' )->justReturn( '' );

				$this->store = new CssStore();
			}
		);

		it(
			'get_version returns empty string when no meta stored',
			function () {
				Functions\when( 'get_post_meta' )->justReturn( '' );
				expect( $this->store->get_version( 42 ) )->toBe( '' );
			}
		);

		it(
			'get_version returns stored version',
			function () {
				Functions\when( 'get_post_meta' )->justReturn( 'abc12345' );
				expect( $this->store->get_version( 42 ) )->toBe( 'abc12345' );
			}
		);

		it(
			'get returns empty string when nothing stored',
			function () {
				Functions\when( 'get_post_meta' )->justReturn( '' );
				expect( $this->store->get( 99 ) )->toBe( '' );
			}
		);

		it(
			'get returns meta fallback when no file exists',
			function () {
				Functions\when( 'get_post_meta' )->alias(
					function ( int $post_id, string $key, bool $single ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
						if ( '_nivorax_css' === $key ) {
								return 'body{color:red}';
						}
						return '';
					}
				);
				// No file written, so get() should fall through to meta.
				$store = new CssStore();
				expect( $store->get( 999 ) )->toBe( 'body{color:red}' );
			}
		);

		it(
			'store returns an 8-char version hash',
			function () {
				// Make wp_mkdir_p fail so ensure_dir returns null → falls back to meta.
				Functions\when( 'wp_mkdir_p' )->justReturn( false );
				$version = $this->store->store( 42, '.nivorax-a{color:red}' );
				expect( strlen( $version ) )->toBe( 8 );
				expect( ctype_xdigit( $version ) )->toBeTrue();
			}
		);

		it(
			'store produces the same version for the same CSS',
			function () {
				Functions\when( 'wp_mkdir_p' )->justReturn( false );
				$css = '.nivorax-a{color:blue}';
				expect( $this->store->store( 1, $css ) )->toBe( $this->store->store( 2, $css ) );
			}
		);

		it(
			'get_url returns null when no file exists',
			function () {
				expect( $this->store->get_url( 42 ) )->toBeNull();
			}
		);
	}
);
