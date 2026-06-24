<?php

declare( strict_types=1 );

use NivoraX\Plugin;

it( 'boots the plugin without error', function (): void {
	// Plugin::boot() is idempotent — calling it a second time is a no-op.
	expect( fn() => Plugin::boot() )->not->toThrow( Throwable::class );
} );

it( 'defines the version constant', function (): void {
	expect( NIVORAX_VERSION )->toBe( '0.1.0' );
} );
