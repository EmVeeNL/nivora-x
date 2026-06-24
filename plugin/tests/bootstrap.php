<?php

declare( strict_types=1 );

require_once dirname( __DIR__ ) . '/vendor/autoload.php';

// Define the WordPress ABSPATH constant so plugin files don't exit early.
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', '/tmp/wp/' );
}

// Define plugin constants mirroring nivorax.php so they're available in tests.
if ( ! defined( 'NIVORAX_VERSION' ) ) {
	define( 'NIVORAX_VERSION', '0.1.0' );
	define( 'NIVORAX_PLUGIN_FILE', dirname( __DIR__ ) . '/nivorax.php' );
	define( 'NIVORAX_PLUGIN_DIR', dirname( __DIR__ ) . '/' );
	define( 'NIVORAX_PLUGIN_URL', 'http://localhost/wp-content/plugins/nivorax/' );
}
