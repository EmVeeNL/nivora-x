<?php

declare( strict_types=1 );

namespace NivoraX\Admin;

use NivoraX\Capabilities\Capabilities;

defined( 'ABSPATH' ) || exit;

/**
 * Registers the top-level NivoraX admin menu and its sub-screens.
 */
final class Menu {

	public const SLUG_ROOT      = 'nivorax';
	public const SLUG_ALL       = 'nivorax-all-pages';
	public const SLUG_NEW       = 'nivorax-new-page';
	public const SLUG_TEMPLATES = 'nivorax-templates';
	public const SLUG_SETTINGS  = 'nivorax-settings';

	/** Hooks admin_menu to register the menu tree. */
	public static function register(): void {
		add_action( 'admin_menu', [ self::class, 'add_menu' ] );
	}

	/** Registers the top-level menu page and all sub-pages. */
	public static function add_menu(): void {
		add_menu_page(
			__( 'NivoraX', 'nivorax' ),
			__( 'NivoraX', 'nivorax' ),
			Capabilities::EDIT_CAP,
			self::SLUG_ROOT,
			[ Screen\AllPagesScreen::class, 'render' ],
			'dashicons-layout',
			6
		);

		add_submenu_page(
			self::SLUG_ROOT,
			__( 'All Pages — NivoraX', 'nivorax' ),
			__( 'All Pages', 'nivorax' ),
			Capabilities::EDIT_CAP,
			self::SLUG_ALL,
			[ Screen\AllPagesScreen::class, 'render' ]
		);

		add_submenu_page(
			self::SLUG_ROOT,
			__( 'New Page — NivoraX', 'nivorax' ),
			__( 'New Page', 'nivorax' ),
			Capabilities::EDIT_CAP,
			self::SLUG_NEW,
			[ Screen\NewPageScreen::class, 'render' ]
		);

		add_submenu_page(
			self::SLUG_ROOT,
			__( 'Templates — NivoraX', 'nivorax' ),
			__( 'Templates', 'nivorax' ),
			Capabilities::EDIT_CAP,
			self::SLUG_TEMPLATES,
			[ Screen\TemplatesScreen::class, 'render' ]
		);

		add_submenu_page(
			self::SLUG_ROOT,
			__( 'Settings — NivoraX', 'nivorax' ),
			__( 'Settings', 'nivorax' ),
			Capabilities::MANAGE_CAP,
			self::SLUG_SETTINGS,
			[ Screen\SettingsScreen::class, 'render' ]
		);

		// Remove the redundant auto-generated first submenu item.
		remove_submenu_page( self::SLUG_ROOT, self::SLUG_ROOT );
	}
}
