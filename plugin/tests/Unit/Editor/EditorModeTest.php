<?php

declare( strict_types=1 );

use NivoraX\Editor\EditorMode;

describe(
	'EditorMode constants',
	function (): void {

		it(
			'defines MODE_NIVORAX and MODE_DEFAULT',
			function (): void {
				expect( EditorMode::MODE_NIVORAX )->toBe( 'nivorax' )
				->and( EditorMode::MODE_DEFAULT )->toBe( 'default' );
			}
		);

		it(
			'defines the correct meta key',
			function (): void {
				expect( EditorMode::META_KEY )->toBe( '_nivorax_edit_mode' );
			}
		);
	}
);
