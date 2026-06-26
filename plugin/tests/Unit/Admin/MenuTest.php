<?php

declare( strict_types=1 );

use NivoraX\Admin\Menu;

describe(
	'Menu slugs',
	function (): void {

		it(
			'defines stable slug constants',
			function (): void {
				expect( Menu::SLUG_ROOT )->toBe( 'nivorax' )
				->and( Menu::SLUG_ALL )->toBe( 'nivorax-all-pages' )
				->and( Menu::SLUG_NEW )->toBe( 'nivorax-new-page' )
				->and( Menu::SLUG_SETTINGS )->toBe( 'nivorax-settings' );
			}
		);
	}
);
