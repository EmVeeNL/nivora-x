<?php

declare( strict_types=1 );

namespace NivoraX\Admin\Screen;

use NivoraX\Admin\Menu;
use NivoraX\Assets\AssetManager;
use NivoraX\Capabilities\Capabilities;
use NivoraX\Editor\Bootstrap;
use NivoraX\Editor\EditorMode;

defined( 'ABSPATH' ) || exit;

/**
 * Full-screen NivoraX editor admin screen.
 *
 * Phase 02: placeholder mount point. Phase 03 builds the real shell into it.
 */
final class EditorScreen {

	public const NONCE_ACTION = 'nivorax_edit_%d';

	/** Hooks admin_menu to register the hidden editor page. */
	public static function register(): void {
		add_action( 'admin_menu', [ self::class, 'add_page' ] );
		// Remove the editor screen from the admin menu (it's a hidden page).
		add_action( 'admin_head', [ self::class, 'hide_from_menu' ] );
	}

	/** Registers the editor as a hidden submenu page. */
	public static function add_page(): void {
		add_submenu_page(
			Menu::SLUG_ROOT,
			__( 'Edit — NivoraX', 'nivorax' ),
			'',
			Capabilities::EDIT_CAP,
			'nivorax-editor',
			[ self::class, 'render' ]
		);
	}

	/** Removes the editor page from the visible admin menu. */
	public static function hide_from_menu(): void {
		remove_submenu_page( Menu::SLUG_ROOT, 'nivorax-editor' );
	}

	/**
	 * Build the URL to the editor screen for a given post.
	 *
	 * @param int $post_id Post ID.
	 */
	public static function url( int $post_id ): string {
		return add_query_arg(
			[
				'page'     => 'nivorax-editor',
				'post'     => $post_id,
				'_wpnonce' => wp_create_nonce( sprintf( self::NONCE_ACTION, $post_id ) ),
			],
			admin_url( 'admin.php' )
		);
	}

	/** Validates the request and outputs the full-screen editor HTML page. */
	public static function render(): void {
		// Validate post ID.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$post_id = isset( $_GET['post'] ) ? (int) $_GET['post'] : 0;
		if ( $post_id <= 0 ) {
			wp_die( esc_html__( 'Invalid post ID.', 'nivorax' ) );
		}

		// Validate nonce.
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$nonce = isset( $_GET['_wpnonce'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['_wpnonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, sprintf( self::NONCE_ACTION, $post_id ) ) ) {
			wp_die( esc_html__( 'Security check failed.', 'nivorax' ) );
		}

		// Validate capability.
		if ( ! Capabilities::user_can_edit_post( $post_id ) ) {
			wp_die( esc_html__( 'You do not have permission to edit this post with NivoraX.', 'nivorax' ) );
		}

		$post = get_post( $post_id );
		if ( ! $post instanceof \WP_Post ) {
			wp_die( esc_html__( 'Post not found.', 'nivorax' ) );
		}

		// Set mode to nivorax when opening the editor.
		EditorMode::set_nivorax( $post_id );
		$mode = EditorMode::get( $post_id );

		// Enqueue editor bundle.
		AssetManager::enqueue_for_editor();

		// Pass bootstrap data to the app.
		wp_localize_script(
			'nivorax-editor',
			'nivoraxBootstrap',
			Bootstrap::data( $post_id, $mode )
		);

		// Full-screen takeover: suppress admin chrome.
		remove_all_actions( 'admin_notices' );
		?>
		<!DOCTYPE html>
		<html <?php language_attributes(); ?>>
		<head>
			<meta charset="<?php bloginfo( 'charset' ); ?>">
			<meta name="viewport" content="width=device-width,initial-scale=1">
			<title><?php echo esc_html( get_the_title( $post_id ) ); ?> — NivoraX</title>
			<?php do_action( 'admin_enqueue_scripts', 'nivorax-editor' ); ?>
			<?php wp_head(); ?>
		</head>
		<body class="nivorax-editor-body">
			<div id="nivorax-editor-root"></div>
			<?php wp_footer(); ?>
		</body>
		</html>
		<?php
		exit;
	}
}
