<?php

declare( strict_types=1 );

namespace NivoraX\Editor;

use NivoraX\Capabilities\Capabilities;
use NivoraX\Settings\Breakpoints;
use NivoraX\Templates\TemplateModel;
use NivoraX\Templates\TemplatePostType;

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
			'postId'            => $post_id,
			'mode'              => $mode,
			'template'          => self::template_context( $post_id ),
			'restRoot'          => esc_url_raw( rest_url() ),
			'restNonce'         => wp_create_nonce( 'wp_rest' ),
			'adminUrl'          => admin_url(),
			'pagesUrl'          => admin_url( 'admin.php?page=' . \NivoraX\Admin\Menu::SLUG_ALL ),
			'homeUrl'           => home_url( '/' ),
			'siteName'          => get_bloginfo( 'name' ),
			'postTitle'         => get_the_title( $post_id ),
			'version'           => NIVORAX_VERSION,
			'canManageSettings' => Capabilities::current_user_can_manage(),
			'breakpoints'       => Breakpoints::all(),
		];
	}

	/**
	 * Template-editing context when the edited post is a NivoraX template.
	 *
	 * Returns null for regular page content so the editor stays in page mode;
	 * returns `{ type }` (header/footer/single/…) when editing a template, which
	 * the editor uses to surface template-only elements (content slot, loop).
	 *
	 * @param int $post_id Post being edited.
	 * @return array{type: string}|null
	 */
	private static function template_context( int $post_id ): ?array {
		if ( TemplatePostType::POST_TYPE !== get_post_type( $post_id ) ) {
			return null;
		}
		return [ 'type' => TemplateModel::get_type( $post_id ) ];
	}
}
