<?php

declare( strict_types=1 );

namespace NivoraX;

defined( 'ABSPATH' ) || exit;

/**
 * Main plugin bootstrap.
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

		// Phase 01 — asset pipeline.
		Assets\AssetManager::register();

		// Phase 02 — plugin foundation.
		Storage\DocumentStore::register();
		Editor\EditorMode::register();

		// Phase 04 — document REST API.
		Rest\DocumentController::register();
		Admin\Menu::register();
		Admin\Settings\SettingsPage::register();
		Admin\Screen\EditorScreen::register();
		Admin\Screen\AllPagesScreen::register();
		Integration\PostTypeIntegration::register();
		FrontEnd\RenderSwitch::register();
	}

	/** Runs on plugin activation. */
	public static function activate(): void {
		flush_rewrite_rules();
	}

	/** Runs on plugin deactivation. */
	public static function deactivate(): void {
		flush_rewrite_rules();
	}
}
