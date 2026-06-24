<?php
/**
 * PHPStan bootstrap — declares plugin-defined constants so static analysis
 * doesn't report them as undefined.
 *
 * @package NivoraX
 */

define( 'NIVORAX_VERSION', '0.1.0' );
define( 'NIVORAX_PLUGIN_FILE', __DIR__ . '/nivorax.php' );
define( 'NIVORAX_PLUGIN_DIR', __DIR__ . '/' );
define( 'NIVORAX_PLUGIN_URL', 'http://localhost/wp-content/plugins/nivorax/' );
