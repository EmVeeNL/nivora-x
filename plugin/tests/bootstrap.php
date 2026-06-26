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

// Minimal WP_Post stub so renderers that type-check against it work in unit
// tests (WordPress core is not loaded). Only the properties NivoraX reads.
// phpcs:disable Squiz.Commenting.VariableComment.Missing, Squiz.Commenting.ClassComment.Missing, Generic.Formatting.MultipleStatementAlignment.NotSameWarning
if ( ! class_exists( 'WP_Post' ) ) {
	/** Lightweight WP_Post stand-in for unit tests. */
	class WP_Post {
		public int $ID = 0;
		public string $post_content = '';
		public string $post_title = '';
		public string $post_type = 'post';
		public string $post_status = 'publish';

		/**
		 * Seed properties from an associative array.
		 *
		 * @param array<string, mixed> $props Property values.
		 */
		public function __construct( array $props = [] ) {
			foreach ( $props as $key => $value ) {
				if ( property_exists( $this, $key ) ) {
					$this->$key = $value;
				}
			}
		}
	}
}
// phpcs:enable Squiz.Commenting.VariableComment.Missing, Squiz.Commenting.ClassComment.Missing, Generic.Formatting.MultipleStatementAlignment.NotSameWarning
