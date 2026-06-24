<?php

declare( strict_types=1 );

namespace NivoraX;

defined( 'ABSPATH' ) || exit;

/**
 * Main plugin bootstrap.
 *
 * Booted once from nivorax.php after the Composer autoloader is loaded.
 * Activation/deactivation hooks are no-ops until the relevant phases add work.
 */
final class Plugin {

	/**
	 * Whether the plugin has already been booted this request.
	 *
	 * @var bool
	 */
	private static bool $booted = false;

	/** Boots all plugin subsystems exactly once per request. */
	public static function boot(): void {
		if ( self::$booted ) {
			return;
		}
		self::$booted = true;

		Assets\AssetManager::register();
		Admin\EditorPage::register();
	}

	/** Runs on plugin activation. */
	public static function activate(): void {
		// Activation tasks (flush rewrite rules, etc.) wired in later phases.
		flush_rewrite_rules();
	}

	/** Runs on plugin deactivation. */
	public static function deactivate(): void {
		flush_rewrite_rules();
	}
}
