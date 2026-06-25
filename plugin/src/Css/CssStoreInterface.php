<?php

declare( strict_types=1 );

namespace NivoraX\Css;

defined( 'ABSPATH' ) || exit;

/**
 * Contract for the CSS store — allows mocking in tests.
 */
interface CssStoreInterface {

	/**
	 * Store generated CSS for a post.
	 *
	 * @param int    $post_id Post ID.
	 * @param string $css     Generated CSS string.
	 * @return string New version hash.
	 */
	public function store( int $post_id, string $css ): string;

	/**
	 * Retrieve stored CSS for a post.
	 *
	 * @param int $post_id Post ID.
	 * @return string CSS string, or empty string when nothing is stored.
	 */
	public function get( int $post_id ): string;

	/**
	 * Return the stored version hash for a post's CSS.
	 *
	 * @param int $post_id Post ID.
	 * @return string Version hash, or empty string when none stored.
	 */
	public function get_version( int $post_id ): string;

	/**
	 * Return the public URL for the CSS file, or null when unavailable.
	 *
	 * @param int $post_id Post ID.
	 * @return string|null Public URL or null.
	 */
	public function get_url( int $post_id ): ?string;
}
