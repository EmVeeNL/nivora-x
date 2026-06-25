<?php

declare( strict_types=1 );

namespace NivoraX\Editor;

defined( 'ABSPATH' ) || exit;

/**
 * Assembles the bootstrap data passed to the React editor app.
 *
 * Exposed via wp_localize_script() as `window.nivoraxBootstrap`.
 */
final class Bootstrap {

	/**
	 * Returns the bootstrap data array for the given post and mode.
	 *
	 * @param int    $post_id Post being edited.
	 * @param string $mode    Current editor mode.
	 * @return array<string, mixed>
	 */
	public static function data( int $post_id, string $mode ): array {
		return [
			'postId'    => $post_id,
			'mode'      => $mode,
			'restRoot'  => esc_url_raw( rest_url() ),
			'restNonce' => wp_create_nonce( 'wp_rest' ),
			'adminUrl'  => admin_url(),
			'pagesUrl'  => admin_url( 'admin.php?page=' . \NivoraX\Admin\Menu::SLUG_ALL ),
			'homeUrl'   => home_url( '/' ),
			'siteName'  => get_bloginfo( 'name' ),
			'postTitle' => get_the_title( $post_id ),
			'version'   => NIVORAX_VERSION,
		];
	}
}
