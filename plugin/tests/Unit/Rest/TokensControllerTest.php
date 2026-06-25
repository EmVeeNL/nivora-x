<?php

declare( strict_types=1 );

use NivoraX\Rest\TokensController;

describe(
	'TokensController',
	function (): void {

		it(
			'defines the correct namespace and route',
			function (): void {
				expect( TokensController::NAMESPACE )->toBe( 'nivorax/v1' )
					->and( TokensController::ROUTE )->toBe( '/tokens' );
			}
		);
	}
);
