<?php

declare( strict_types=1 );

namespace NivoraX\Storage;

use NivoraX\Capabilities\Capabilities;

defined( 'ABSPATH' ) || exit;

/**
 * Reads and writes the NivoraX document envelope in post meta.
 */
final class DocumentStore {

	public const META_KEY = '_nivorax_data';

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
	 * Read the envelope for a post. Returns empty default if nothing is stored.
	 *
	 * @param int $post_id Post ID.
	 */
	public static function read( int $post_id ): Envelope {
		$raw = get_post_meta( $post_id, self::META_KEY, true );
		return Envelope::from_json( is_string( $raw ) ? $raw : '' );
	}

	/**
	 * Persist an envelope to post meta.
	 *
	 * @param int      $post_id  Post ID.
	 * @param Envelope $envelope Envelope to persist.
	 * @throws \RuntimeException If the caller lacks the required capability.
	 */
	public static function write( int $post_id, Envelope $envelope ): bool {
		if ( ! Capabilities::user_can_edit_post( $post_id ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \RuntimeException( 'Current user cannot edit post ' . $post_id );
		}

		$result = update_post_meta( $post_id, self::META_KEY, $envelope->to_json() );
		return false !== $result;
	}
}
