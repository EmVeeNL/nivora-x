<?php

declare( strict_types=1 );

namespace NivoraX\Editor;

use NivoraX\Capabilities\Capabilities;

defined( 'ABSPATH' ) || exit;

/**
 * Manages the per-post editor mode flag (_nivorax_edit_mode).
 *
 * Possible values: 'nivorax' | 'default'.
 * Default (when the meta key is absent) is 'default' — Gutenberg.
 */
final class EditorMode {

	public const META_KEY     = '_nivorax_edit_mode';
	public const MODE_NIVORAX = 'nivorax';
	public const MODE_DEFAULT = 'default';

	/** Registers the post meta key with WordPress. */
	public static function register(): void {
		register_post_meta(
			'',
			self::META_KEY,
			[
				'type'          => 'string',
				'single'        => true,
				'show_in_rest'  => false,
				'auth_callback' => static fn(): bool => Capabilities::current_user_can_edit(),
			]
		);
	}

	/**
	 * Get the editor mode for a post. Returns 'default' when unset.
	 *
	 * @param int $post_id Post ID.
	 */
	public static function get( int $post_id ): string {
		$value = get_post_meta( $post_id, self::META_KEY, true );
		if ( ! is_string( $value ) || '' === $value ) {
			return self::MODE_DEFAULT;
		}
		return self::MODE_NIVORAX === $value ? self::MODE_NIVORAX : self::MODE_DEFAULT;
	}

	/**
	 * Switch a post to NivoraX editing mode.
	 *
	 * @param int $post_id Post ID.
	 */
	public static function set_nivorax( int $post_id ): bool {
		return self::set( $post_id, self::MODE_NIVORAX );
	}

	/**
	 * Switch a post back to the default (Gutenberg) mode.
	 *
	 * @param int $post_id Post ID.
	 */
	public static function set_default( int $post_id ): bool {
		return self::set( $post_id, self::MODE_DEFAULT );
	}

	/**
	 * Returns true when the post is currently in NivoraX mode.
	 *
	 * @param int $post_id Post ID.
	 */
	public static function is_nivorax( int $post_id ): bool {
		return self::MODE_NIVORAX === self::get( $post_id );
	}

	/**
	 * Persists the mode value to post meta.
	 *
	 * @param int    $post_id Post ID.
	 * @param string $mode    Mode to store.
	 */
	private static function set( int $post_id, string $mode ): bool {
		if ( ! Capabilities::user_can_edit_post( $post_id ) ) {
			return false;
		}
		return false !== update_post_meta( $post_id, self::META_KEY, $mode );
	}
}
