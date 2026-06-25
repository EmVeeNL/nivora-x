<?php

declare( strict_types=1 );

use NivoraX\Rest\SettingsController;

describe(
	'SettingsController',
	function (): void {

		it(
			'defines the correct namespace and route',
			function (): void {
				expect( SettingsController::NAMESPACE )->toBe( 'nivorax/v1' )
					->and( SettingsController::ROUTE )->toBe( '/settings/breakpoints' );
			}
		);
	}
);
