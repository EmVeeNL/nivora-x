<?php

declare( strict_types=1 );

use NivoraX\Rest\DocumentController;
use NivoraX\Storage\Envelope;

describe(
	'DocumentController',
	function (): void {

		it(
			'defines the correct namespace and route',
			function (): void {
				expect( DocumentController::NAMESPACE )->toBe( 'nivorax/v1' )
				->and( DocumentController::ROUTE )->toBe( '/documents/(?P<id>[\d]+)' );
			}
		);

		it(
			'GET response shape matches Phase 02 Envelope keys',
			function (): void {
				$envelope = new Envelope(
					1,
					[
						'rootId' => 'nx-root0001',
						'nodes'  => [],
					],
					[ 'title' => 'Home' ]
				);

				$data = [
					'version' => $envelope->version,
					'tree'    => $envelope->tree,
					'meta'    => $envelope->meta,
				];

				expect( $data )->toHaveKey( 'version' )
				->and( $data )->toHaveKey( 'tree' )
				->and( $data )->toHaveKey( 'meta' )
				->and( $data['version'] )->toBe( 1 )
				->and( $data['meta'] )->toBe( [ 'title' => 'Home' ] );
			}
		);

		it(
			'save response shape contains saved and version keys',
			function (): void {
				$version  = Envelope::CURRENT_VERSION;
				$response = [
					'saved'   => true,
					'version' => $version,
				];

				expect( $response )->toHaveKey( 'saved' )
				->and( $response )->toHaveKey( 'version' )
				->and( $response['saved'] )->toBeTrue()
				->and( $response['version'] )->toBe( $version );
			}
		);

		it(
			'id validation callback accepts positive integers',
			function (): void {
				// Access the private validator via reflection.
				$ref      = new ReflectionClass( DocumentController::class );
				$method   = $ref->getMethod( 'id_arg' );
				$arg      = $method->invoke( null );
				$callback = $arg['id']['validate_callback'];

				expect( $callback( '1' ) )->toBeTrue()
				->and( $callback( '999' ) )->toBeTrue()
				->and( $callback( '0' ) )->toBeFalse()
				->and( $callback( '-1' ) )->toBeFalse()
				->and( $callback( 'abc' ) )->toBeFalse();
			}
		);
	}
);
