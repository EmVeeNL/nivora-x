<?php

declare( strict_types=1 );

namespace NivoraX\Css;

defined( 'ABSPATH' ) || exit;

/**
 * Stores and retrieves generated CSS for a NivoraX post.
 *
 * Strategy (in preference order):
 *  1. Filesystem — writes to `{uploads}/nivorax-css/{post_id}.css` for fast
 *     static delivery. Versioned via a `nivorax_css_version_{id}` postmeta key
 *     so query-string cache-busting works without re-reading the file.
 *  2. Postmeta fallback — when the file cannot be written (e.g. uploads not
 *     writable), the CSS string is stored in postmeta instead.
 *
 * Public API: `store()` / `get()` / `get_version()` / `get_url()`.
 */
final class CssStore implements CssStoreInterface {

	private const META_CSS     = '_nivorax_css';
	private const META_VERSION = '_nivorax_css_version';
	private const SUBDIR       = 'nivorax-css';

	/**
	 * Upload directory info, resolved once per request.
	 *
	 * @var array{basedir: string, baseurl: string}|null
	 */
	private ?array $uploads = null;

	// -------------------------------------------------------------------------
	// Public API
	// -------------------------------------------------------------------------

	/**
	 * Store generated CSS for a post.
	 *
	 * @param int    $post_id Post ID.
	 * @param string $css     Generated CSS string.
	 * @return string New version hash.
	 */
	public function store( int $post_id, string $css ): string {
		$version = $this->new_version( $css );

		if ( ! $this->write_file( $post_id, $css ) ) {
			// Fall back to postmeta when filesystem write fails.
			update_post_meta( $post_id, self::META_CSS, $css );
		}

		update_post_meta( $post_id, self::META_VERSION, $version );

		return $version;
	}

	/**
	 * Retrieve stored CSS for a post.
	 *
	 * @param int $post_id Post ID.
	 * @return string CSS string, or empty string when nothing is stored.
	 */
	public function get( int $post_id ): string {
		$file_path = $this->file_path( $post_id );

		if ( null !== $file_path && file_exists( $file_path ) ) {
			$contents = file_get_contents( $file_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			return false !== $contents ? $contents : '';
		}

		$meta = get_post_meta( $post_id, self::META_CSS, true );
		return is_string( $meta ) ? $meta : '';
	}

	/**
	 * Return the stored version hash for a post's CSS (for cache-busting).
	 *
	 * @param int $post_id Post ID.
	 * @return string Version hash, or empty string when none stored.
	 */
	public function get_version( int $post_id ): string {
		$meta = get_post_meta( $post_id, self::META_VERSION, true );
		return is_string( $meta ) ? $meta : '';
	}

	/**
	 * Return the public URL for the CSS file (filesystem path) if available.
	 * Returns null when the file does not exist (meta fallback will be used).
	 *
	 * @param int $post_id Post ID.
	 * @return string|null Public URL or null.
	 */
	public function get_url( int $post_id ): ?string {
		$file_path = $this->file_path( $post_id );
		if ( null === $file_path || ! file_exists( $file_path ) ) {
			return null;
		}

		$uploads = $this->uploads();
		return $uploads['baseurl'] . '/' . self::SUBDIR . "/{$post_id}.css";
	}

	// -------------------------------------------------------------------------
	// Internal helpers
	// -------------------------------------------------------------------------

	/**
	 * Write the CSS string to a file in the uploads directory.
	 *
	 * @param int    $post_id Post ID.
	 * @param string $css     CSS string.
	 * @return bool Whether the write succeeded.
	 */
	private function write_file( int $post_id, string $css ): bool {
		$dir = $this->ensure_dir();
		if ( null === $dir ) {
			return false;
		}

		$path = "{$dir}/{$post_id}.css";
		return false !== file_put_contents( $path, $css, LOCK_EX ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
	}

	/**
	 * Ensure the CSS sub-directory exists and return its absolute path.
	 * Returns null when the directory could not be created or written.
	 *
	 * @return string|null Absolute path to directory, or null on failure.
	 */
	private function ensure_dir(): ?string {
		$uploads = $this->uploads();
		$dir     = $uploads['basedir'] . '/' . self::SUBDIR;

		if ( ! is_dir( $dir ) ) {
			if ( ! wp_mkdir_p( $dir ) ) {
				return null;
			}
		}

		return is_writable( $dir ) ? $dir : null; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_is_writable,WordPress.VIP.FileSystemWritesDisallow.file_ops_is_writable
	}

	/**
	 * Return the absolute filesystem path for a post's CSS file.
	 * Returns null when the uploads directory cannot be determined.
	 *
	 * @param int $post_id Post ID.
	 * @return string|null
	 */
	private function file_path( int $post_id ): ?string {
		$uploads = $this->uploads();
		if ( empty( $uploads['basedir'] ) ) {
			return null;
		}
		return $uploads['basedir'] . '/' . self::SUBDIR . "/{$post_id}.css";
	}

	/**
	 * Return (and cache) the WP uploads directory info.
	 *
	 * @return array{basedir: string, baseurl: string}
	 */
	private function uploads(): array {
		if ( null === $this->uploads ) {
			$info          = wp_upload_dir();
			$this->uploads = [
				'basedir' => rtrim( (string) $info['basedir'], '/' ),
				'baseurl' => rtrim( (string) $info['baseurl'], '/' ),
			];
		}
		return $this->uploads;
	}

	/**
	 * Generate a short, stable version hash from the CSS content.
	 *
	 * @param string $css CSS string.
	 * @return string 8-character hex hash.
	 */
	private function new_version( string $css ): string {
		return substr( md5( $css ), 0, 8 );
	}
}
