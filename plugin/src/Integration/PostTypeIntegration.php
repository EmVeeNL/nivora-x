<?php

declare( strict_types=1 );

namespace NivoraX\Integration;

use NivoraX\Admin\Screen\EditorScreen;
use NivoraX\Capabilities\Capabilities;
use NivoraX\Editor\EditorMode;
use NivoraX\Settings\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Adds "Edit with NivoraX" affordances to enabled post types:
 * - A button on the native Gutenberg edit screen.
 * - A row action in the WP_List_Table (post list).
 * - An admin notice in the NivoraX editor offering a way back to Gutenberg.
 */
final class PostTypeIntegration {

	/** Registers all hooks for native WP screen integration. */
	public static function register(): void {
		add_action( 'post_submitbox_misc_actions', [ self::class, 'render_edit_screen_button' ] );
		add_filter( 'page_row_actions', [ self::class, 'add_row_action' ], 10, 2 );
		add_filter( 'post_row_actions', [ self::class, 'add_row_action' ], 10, 2 );
		add_action( 'admin_notices', [ self::class, 'render_back_to_gutenberg_notice' ] );
	}

	/** "Edit with NivoraX" button in the Gutenberg publish panel. */
	public static function render_edit_screen_button(): void {
		$post = get_post();
		if ( ! $post instanceof \WP_Post ) {
			return;
		}
		if ( ! Settings::instance()->is_enabled_for( $post->post_type ) ) {
			return;
		}
		if ( ! Capabilities::user_can_edit_post( $post->ID ) ) {
			return;
		}
		if ( EditorMode::is_nivorax( $post->ID ) ) {
			return; // Already in NivoraX — show "Back" notice instead.
		}
		?>
		<div class="misc-pub-section">
			<a href="<?php echo esc_url( EditorScreen::url( $post->ID ) ); ?>"
				class="button button-secondary">
				<?php echo esc_html( Settings::instance()->get_editor_label() ); ?>
			</a>
		</div>
		<?php
	}

	/**
	 * "Edit with NivoraX" row action in the post list table.
	 *
	 * @param array<string, string> $actions Existing row actions.
	 * @param \WP_Post              $post    The post row.
	 * @return array<string, string>
	 */
	public static function add_row_action( array $actions, \WP_Post $post ): array {
		if ( ! Settings::instance()->is_enabled_for( $post->post_type ) ) {
			return $actions;
		}
		if ( ! Capabilities::user_can_edit_post( $post->ID ) ) {
			return $actions;
		}

		$label = Settings::instance()->get_editor_label();
		$url   = EditorScreen::url( $post->ID );

		$actions['nivorax_edit'] = sprintf(
			'<a href="%s">%s</a>',
			esc_url( $url ),
			esc_html( $label )
		);

		return $actions;
	}

	/** Admin notice inside NivoraX-mode posts offering to go back to Gutenberg. */
	public static function render_back_to_gutenberg_notice(): void {
		$screen = get_current_screen();
		if ( ! $screen || 'post' !== $screen->base ) {
			return;
		}
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$post_id = isset( $_GET['post'] ) ? (int) $_GET['post'] : 0;
		if ( $post_id <= 0 ) {
			return;
		}
		if ( ! EditorMode::is_nivorax( $post_id ) ) {
			return;
		}

		$editor_url = EditorScreen::url( $post_id );
		?>
		<div class="notice notice-info">
			<p>
				<?php esc_html_e( 'This page is built with NivoraX.', 'nivorax' ); ?>
				<a href="<?php echo esc_url( $editor_url ); ?>">
					<?php esc_html_e( 'Open NivoraX editor', 'nivorax' ); ?>
				</a>
			</p>
		</div>
		<?php
	}
}
