<?php

declare( strict_types=1 );

use NivoraX\Storage\Envelope;

describe(
	'Envelope',
	function (): void {

		it(
			'creates a well-formed empty default',
			function (): void {
				$env = Envelope::empty();
				expect( $env->version )->toBe( Envelope::CURRENT_VERSION )
				->and( $env->tree )->toBeNull()
				->and( $env->meta )->toBe( [] );
			}
		);

		it(
			'round-trips through JSON',
			function (): void {
				$original = new Envelope(
					1,
					[
						'type'     => 'root',
						'children' => [],
					],
					[ 'title' => 'Test' ]
				);
				$json     = $original->to_json();
				$restored = Envelope::from_json( $json );

				expect( $restored->version )->toBe( 1 )
				->and( $restored->tree )->toBe(
					[
						'type'     => 'root',
						'children' => [],
					]
				)
				->and( $restored->meta )->toBe( [ 'title' => 'Test' ] );
			}
		);

		it(
			'returns empty default for an empty string',
			function (): void {
				$env = Envelope::from_json( '' );
				expect( $env->version )->toBe( Envelope::CURRENT_VERSION )
				->and( $env->tree )->toBeNull();
			}
		);

		it(
			'returns empty default for malformed JSON',
			function (): void {
				$env = Envelope::from_json( '{not valid json' );
				expect( $env->version )->toBe( Envelope::CURRENT_VERSION )
				->and( $env->tree )->toBeNull();
			}
		);

		it(
			'returns empty default when JSON is not an object',
			function (): void {
				$env = Envelope::from_json( '"just a string"' );
				expect( $env->tree )->toBeNull();
			}
		);

		it(
			'serialises to a JSON string with all required keys',
			function (): void {
				$env  = Envelope::empty();
				$json = $env->to_json();
				$data = json_decode( $json, true );

				expect( $data )->toBeArray()
				->and( $data )->toHaveKey( 'version' )
				->and( $data )->toHaveKey( 'tree' )
				->and( $data )->toHaveKey( 'meta' );
			}
		);
	}
);
