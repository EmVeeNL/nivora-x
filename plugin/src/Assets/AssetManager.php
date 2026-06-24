<?php

declare( strict_types=1 );

namespace NivoraX\Assets;

defined( 'ABSPATH' ) || exit;

/**
 * Enqueues the Vite-built editor assets in both production and dev-server modes.
 *
 * Production: reads plugin/build/.vite/manifest.json to get hashed filenames.
 * Development: loads @vite/client + entry directly from the Vite dev server.
 */
final class AssetManager {

	private const BUILD_DIR  = NIVORAX_PLUGIN_DIR . 'build/';
	private const BUILD_URL  = NIVORAX_PLUGIN_URL . 'build/';
	private const MANIFEST   = self::BUILD_DIR . '.vite/manifest.json';
	private const ENTRY_FILE = 'main.tsx';
	private const HANDLE     = 'nivorax-editor';

	/** Hooks admin_enqueue_scripts for pages that include 'nivorax' in the hook suffix. */
	public static function register(): void {
		add_action( 'admin_enqueue_scripts', [ self::class, 'enqueue' ] );
	}

	/**
	 * Enqueue assets only on the NivoraX admin page.
	 *
	 * @param string $hook Current admin page hook suffix.
	 */
	public static function enqueue( string $hook ): void {
		if ( ! str_contains( $hook, 'nivorax' ) ) {
			return;
		}

		if ( self::is_dev() ) {
			self::enqueue_dev();
		} else {
			self::enqueue_production();
		}
	}

	/** Whether the Vite dev server is enabled via NIVORAX_VITE_DEV. */
	private static function is_dev(): bool {
		return defined( 'NIVORAX_VITE_DEV' ) && NIVORAX_VITE_DEV === true;
	}

	/** Enqueues the entry point and Vite client from the local dev server. */
	private static function enqueue_dev(): void {
		$origin = defined( 'NIVORAX_VITE_ORIGIN' )
			? (string) NIVORAX_VITE_ORIGIN
			: 'http://localhost:5173';

		// @vite/client — must load first. Dev scripts intentionally use null version.
		// phpcs:disable WordPress.WP.EnqueuedResourceParameters.MissingVersion
		wp_enqueue_script(
			self::HANDLE . '-vite-client',
			$origin . '/@vite/client',
			[],
			null,
			[ 'in_footer' => true ]
		);

		wp_enqueue_script(
			self::HANDLE,
			$origin . '/' . self::ENTRY_FILE,
			[ self::HANDLE . '-vite-client' ],
			null,
			[ 'in_footer' => true ]
		);
		// phpcs:enable WordPress.WP.EnqueuedResourceParameters.MissingVersion

		self::set_module_type( self::HANDLE . '-vite-client' );
		self::set_module_type( self::HANDLE );
	}

	/** Reads the Vite manifest and enqueues the hashed production build. */
	private static function enqueue_production(): void {
		if ( ! file_exists( self::MANIFEST ) ) {
			add_action(
				'admin_notices',
				static function (): void {
					echo '<div class="notice notice-error"><p>';
					echo '<strong>NivoraX:</strong> Build assets not found. ';
					echo 'Run <code>pnpm build</code> to generate them.';
					echo '</p></div>';
				}
			);
			return;
		}

		$manifest = json_decode(
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			(string) file_get_contents( self::MANIFEST ),
			true
		);

		if ( ! is_array( $manifest ) ) {
			return;
		}

		/**
		 * Vite manifest map.
		 *
		 * @var array<string, array{file: string, css?: list<string>}> $manifest
		 */
		$entry = $manifest[ self::ENTRY_FILE ] ?? null;
		if ( null === $entry ) {
			return;
		}

		// Enqueue associated CSS files first.
		foreach ( $entry['css'] ?? [] as $index => $css_file ) {
			wp_enqueue_style(
				self::HANDLE . '-css-' . $index,
				self::BUILD_URL . $css_file,
				[],
				NIVORAX_VERSION
			);
		}

		wp_enqueue_script(
			self::HANDLE,
			self::BUILD_URL . $entry['file'],
			[],
			NIVORAX_VERSION,
			[ 'in_footer' => true ]
		);

		self::set_module_type( self::HANDLE );
	}

	/**
	 * Adds type="module" to a script tag. Required for Vite ESM output.
	 *
	 * @param string $handle Registered script handle.
	 */
	private static function set_module_type( string $handle ): void {
		add_filter(
			'script_loader_tag',
			static function ( string $tag, string $h ) use ( $handle ): string {
				if ( $h === $handle ) {
					return str_replace( ' src=', ' type="module" src=', $tag );
				}
				return $tag;
			},
			10,
			2
		);
	}
}
