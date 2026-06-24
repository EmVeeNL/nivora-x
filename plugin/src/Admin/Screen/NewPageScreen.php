<?php

declare( strict_types=1 );

namespace NivoraX\Admin\Screen;

use NivoraX\Admin\Menu;
use NivoraX\Capabilities\Capabilities;
use NivoraX\Editor\EditorMode;

defined( 'ABSPATH' ) || exit;

/**
 * "New Page" screen — creates a native page draft and routes to the editor.
 */
final class NewPageScreen {

	public const NONCE_ACTION = 'nivorax_new_page';

	/** Renders the new-page form or processes the submitted form. */
	public static function render(): void {
		if ( ! Capabilities::current_user_can_edit() ) {
			wp_die( esc_html__( 'You do not have permission to create pages with NivoraX.', 'nivorax' ) );
		}

		// If the user just submitted the "create" form, process it.
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST['nivorax_create_page'] ) ) {
			self::handle_create();
			return;
		}

		// Show the pre-creation form (title input).
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'New Page — NivoraX', 'nivorax' ); ?></h1>
			<form method="post">
				<?php wp_nonce_field( self::NONCE_ACTION ); ?>
				<table class="form-table">
					<tr>
						<th><label for="nivorax_page_title"><?php esc_html_e( 'Page title', 'nivorax' ); ?></label></th>
						<td>
							<input type="text" id="nivorax_page_title" name="nivorax_page_title"
									class="large-text" placeholder="<?php esc_attr_e( 'Enter title…', 'nivorax' ); ?>">
						</td>
					</tr>
				</table>
				<?php submit_button( __( 'Create & open in NivoraX', 'nivorax' ), 'primary', 'nivorax_create_page' ); ?>
			</form>
		</div>
		<?php
	}

	/** Validates the submitted form, creates the page, and redirects to the editor. */
	private static function handle_create(): void {
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$nonce = isset( $_POST['_wpnonce'] ) ? sanitize_text_field( wp_unslash( (string) $_POST['_wpnonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, self::NONCE_ACTION ) ) {
			wp_die( esc_html__( 'Security check failed.', 'nivorax' ) );
		}

		$title   = isset( $_POST['nivorax_page_title'] )
			? sanitize_text_field( wp_unslash( (string) $_POST['nivorax_page_title'] ) )
			: '';
		$post_id = wp_insert_post(
			[
				'post_title'  => '' !== $title ? $title : __( 'Untitled', 'nivorax' ),
				'post_type'   => 'page',
				'post_status' => 'draft',
			],
			true
		);

		if ( is_wp_error( $post_id ) ) {
			wp_die( esc_html( $post_id->get_error_message() ) );
		}

		EditorMode::set_nivorax( $post_id );

		wp_safe_redirect( EditorScreen::url( $post_id ) );
		exit;
	}
}
