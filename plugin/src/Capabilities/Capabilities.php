<?php

declare( strict_types=1 );

namespace NivoraX\Capabilities;

defined( 'ABSPATH' ) || exit;

/**
 * Central capability checks for NivoraX.
 *
 * Custom caps are registered in phpcs.xml so WPCS stays quiet.
 */
final class Capabilities {

	/** Capability required to edit pages with NivoraX. */
	public const EDIT_CAP = 'edit_pages';

	/** Capability required to manage NivoraX settings. */
	public const MANAGE_CAP = 'manage_options';

	/** Whether the current user can edit pages with NivoraX. */
	public static function current_user_can_edit(): bool {
		return current_user_can( self::EDIT_CAP );
	}

	/** Whether the current user can manage NivoraX settings. */
	public static function current_user_can_manage(): bool {
		return current_user_can( self::MANAGE_CAP );
	}

	/**
	 * Check edit capability for a specific post and user.
	 *
	 * @param int      $post_id Post to check against.
	 * @param int|null $user_id User to check (null = current user).
	 */
	public static function user_can_edit_post( int $post_id, ?int $user_id = null ): bool {
		if ( null !== $user_id ) {
			return user_can( $user_id, 'edit_post', $post_id );
		}
		return current_user_can( 'edit_post', $post_id );
	}
}
