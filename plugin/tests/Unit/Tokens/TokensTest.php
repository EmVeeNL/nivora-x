<?php

declare( strict_types=1 );

use Brain\Monkey\Functions;
use NivoraX\Tokens\Tokens;

describe(
	'Tokens',
	function (): void {

		// Stub WP functions used by Tokens.
		beforeEach(
			function (): void {
				Functions\when( 'sanitize_key' )->alias( fn( string $k ) => strtolower( preg_replace( '/[^a-z0-9_\-]/', '', $k ) ?? $k ) );
				Functions\when( 'sanitize_text_field' )->returnArg();
			}
		);

		it(
			'defaults() returns 19 seeded tokens',
			function (): void {
				expect( Tokens::defaults() )->toHaveCount( 19 );
			}
		);

		it(
			'defaults() contains the expected groups',
			function (): void {
				$groups = array_unique( array_column( Tokens::defaults(), 'group' ) );
				sort( $groups );
				expect( $groups )->toBe( [ 'color', 'effect', 'spacing', 'typography' ] );
			}
		);

		it(
			'each default token has id, group, name, and value',
			function (): void {
				foreach ( Tokens::defaults() as $token ) {
					expect( $token )->toHaveKey( 'id' )
						->and( $token )->toHaveKey( 'group' )
						->and( $token )->toHaveKey( 'name' )
						->and( $token )->toHaveKey( 'value' );
				}
			}
		);

		it(
			'all() seeds defaults when option is null',
			function (): void {
				Functions\when( 'get_option' )->justReturn( null );
				Functions\when( 'update_option' )->justReturn( true );

				$tokens = Tokens::all();
				expect( $tokens )->toHaveCount( 19 );
			}
		);

		it(
			'all() returns stored tokens when present',
			function (): void {
				$stored = [
					[
						'id'    => 'color-foo',
						'group' => 'color',
						'name'  => 'Foo',
						'value' => '#aabbcc',
					],
				];
				Functions\when( 'get_option' )->justReturn( $stored );

				$tokens = Tokens::all();
				expect( $tokens )->toHaveCount( 1 )
					->and( $tokens[0]['id'] )->toBe( 'color-foo' );
			}
		);

		it(
			'save() calls update_option with sanitized tokens',
			function (): void {
				Functions\when( 'update_option' )->justReturn( true );

				$result = Tokens::save(
					[
						[
							'id'    => 'color-save',
							'group' => 'color',
							'name'  => 'Save',
							'value' => '#cc0000',
						],
					]
				);
				expect( $result )->toBeTrue();
			}
		);

		it(
			'find() returns a token by id',
			function (): void {
				Functions\when( 'get_option' )->justReturn( null );
				Functions\when( 'update_option' )->justReturn( true );

				$token = Tokens::find( 'color-primary' );
				expect( $token )->not->toBeNull()
					->and( $token['name'] )->toBe( 'Primary' );
			}
		);

		it(
			'find() returns null for an unknown id',
			function (): void {
				Functions\when( 'get_option' )->justReturn( [] );

				$token = Tokens::find( 'does-not-exist' );
				expect( $token )->toBeNull();
			}
		);

		it(
			'sanitize() discards entries with invalid or missing group',
			function (): void {
				$input  = [
					[
						'id'    => 'valid',
						'group' => 'color',
						'name'  => 'Valid',
						'value' => '#fff',
					],
					[
						'id'    => 'bad',
						'group' => 'unknown',
						'name'  => 'Bad',
						'value' => '#000',
					],
					[
						'id'    => '',
						'group' => 'color',
						'name'  => 'Empty id',
						'value' => '#000',
					],
				];
				$result = Tokens::sanitize( $input );
				expect( $result )->toHaveCount( 1 )
					->and( $result[0]['id'] )->toBe( 'valid' );
			}
		);

		it(
			'sanitize() deduplicates tokens by id',
			function (): void {
				$input  = [
					[
						'id'    => 'dup',
						'group' => 'color',
						'name'  => 'First',
						'value' => '#aaa',
					],
					[
						'id'    => 'dup',
						'group' => 'color',
						'name'  => 'Second',
						'value' => '#bbb',
					],
				];
				$result = Tokens::sanitize( $input );
				expect( $result )->toHaveCount( 1 )
					->and( $result[0]['name'] )->toBe( 'First' );
			}
		);
	}
);
