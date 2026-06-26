<?php

declare( strict_types=1 );

use NivoraX\Rest\TemplatesController;

describe(
	'TemplatesController',
	function (): void {

		it(
			'exposes the templates route under the nivorax namespace',
			function (): void {
				expect( TemplatesController::NAMESPACE )->toBe( 'nivorax/v1' )
				->and( TemplatesController::ROUTE )->toBe( '/templates' );
			}
		);
	}
);
