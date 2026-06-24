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

	public static function register(): void {
		add_action( 'admin_enqueue_scripts', [ self::class, 'enqueue' ] );
	}

	/** Enqueue assets only on the NivoraX admin page. */
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

	// ── Dev mode ──────────────────────────────────────────────────────────────

	private static function is_dev(): bool {
		return defined( 'NIVORAX_VITE_DEV' ) && NIVORAX_VITE_DEV === true;
	}

	private static function enqueue_dev(): void {
		$origin = defined( 'NIVORAX_VITE_ORIGIN' )
			? (string) NIVORAX_VITE_ORIGIN
			: 'http://localhost:5173';

		// @vite/client — must load first.
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

		self::set_module_type( self::HANDLE . '-vite-client' );
		self::set_module_type( self::HANDLE );
	}

	// ── Production mode ───────────────────────────────────────────────────────

	private static function enqueue_production(): void {
		if ( ! file_exists( self::MANIFEST ) ) {
			add_action( 'admin_notices', static function (): void {
				echo '<div class="notice notice-error"><p>';
				echo '<strong>NivoraX:</strong> Build assets not found. ';
				echo 'Run <code>pnpm build</code> to generate them.';
				echo '</p></div>';
			} );
			return;
		}

		$manifest = json_decode(
			(string) file_get_contents( self::MANIFEST ),
			true
		);

		if ( ! is_array( $manifest ) ) {
			return;
		}

		/** @var array<string, array{file: string, css?: list<string>}> $manifest */
		$entry = $manifest[ self::ENTRY_FILE ] ?? null;
		if ( $entry === null ) {
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

	/** Adds type="module" to a script tag. Required for Vite ESM output. */
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
