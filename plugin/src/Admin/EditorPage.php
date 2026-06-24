<?php

declare( strict_types=1 );

namespace NivoraX\Admin;

defined( 'ABSPATH' ) || exit;

/**
 * Registers the NivoraX admin page that hosts the React editor app.
 *
 * The page is a minimal shell — it renders only the mount node (#nivorax-editor-root)
 * that app/main.tsx attaches to. Real editor content is scaffolded in Phase 03.
 */
final class EditorPage {

	public static function register(): void {
		add_action( 'admin_menu', [ self::class, 'add_menu' ] );
	}

	public static function add_menu(): void {
		add_menu_page(
			__( 'NivoraX Editor', 'nivorax' ),
			__( 'NivoraX', 'nivorax' ),
			'edit_pages',
			'nivorax-editor',
			[ self::class, 'render' ],
			'dashicons-layout',
			6
		);
	}

	public static function render(): void {
		echo '<div id="nivorax-editor-root"></div>';
	}
}
