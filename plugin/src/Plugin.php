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

	private static bool $booted = false;

	public static function boot(): void {
		if ( self::$booted ) {
			return;
		}
		self::$booted = true;

		Assets\AssetManager::register();
		Admin\EditorPage::register();
	}

	public static function activate(): void {
		// Activation tasks (flush rewrite rules, etc.) wired in later phases.
		flush_rewrite_rules();
	}

	public static function deactivate(): void {
		flush_rewrite_rules();
	}
}
