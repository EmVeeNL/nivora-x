<?php

declare( strict_types=1 );

/*
 * Integration smoke-test: verifies the plugin skeleton loads and key constants
 * are defined when the autoloader is present.
 *
 * Full WordPress-integration tests (against the Dockerized WP) are added in
 * later phases once the plugin has meaningful behaviour to exercise.
 */

it(
	'defines all required plugin constants',
	function (): void {
		expect( defined( 'NIVORAX_VERSION' ) )->toBeTrue()
		->and( defined( 'NIVORAX_PLUGIN_FILE' ) )->toBeTrue()
		->and( defined( 'NIVORAX_PLUGIN_DIR' ) )->toBeTrue()
		->and( defined( 'NIVORAX_PLUGIN_URL' ) )->toBeTrue();
	}
);

it(
	'plugin directory constant points to an existing directory',
	function (): void {
		expect( is_dir( NIVORAX_PLUGIN_DIR ) )->toBeTrue();
	}
);
