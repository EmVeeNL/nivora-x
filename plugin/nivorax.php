<?php
/**
 * Plugin Name:       NivoraX
 * Plugin URI:        https://nivorax.com
 * Description:       A custom WordPress page and layout builder with a node-tree engine.
 * Version:           0.1.0
 * Requires at least: 7.0
 * Requires PHP:      8.5
 * Author:            Michael Voeten
 * Author URI:        https://voeten.online
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       nivorax
 * Domain Path:       /languages
 */

defined( 'ABSPATH' ) || exit;

define( 'NIVORAX_VERSION', '0.1.0' );
define( 'NIVORAX_PLUGIN_FILE', __FILE__ );
define( 'NIVORAX_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NIVORAX_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Guard against missing Composer autoloader (prevents white-screen on fresh clone).
$autoloader = __DIR__ . '/vendor/autoload.php';
if ( ! file_exists( $autoloader ) ) {
	add_action( 'admin_notices', static function (): void {
		echo '<div class="notice notice-error"><p>';
		echo '<strong>NivoraX:</strong> Composer dependencies are missing. ';
		echo 'Run <code>composer install</code> in the plugin directory.';
		echo '</p></div>';
	} );
	return;
}
require_once $autoloader;

register_activation_hook( __FILE__, [ NivoraX\Plugin::class, 'activate' ] );
register_deactivation_hook( __FILE__, [ NivoraX\Plugin::class, 'deactivate' ] );

NivoraX\Plugin::boot();
