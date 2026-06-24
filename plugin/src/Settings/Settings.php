<?php

declare( strict_types=1 );

namespace NivoraX\Settings;

use NivoraX\Admin\Settings\SettingsPage;

defined( 'ABSPATH' ) || exit;

/**
 * Typed read accessor for NivoraX options.
 *
 * All plugin code reads settings through here — never directly from get_option().
 */
final class Settings {

	/**
	 * Singleton instance.
	 *
	 * @var self|null
	 */
	private static ?self $instance = null;

	/**
	 * Cached options array.
	 *
	 * @var array<string, mixed>
	 */
	private array $options;

	/** Loads options from the database. */
	private function __construct() {
		$this->options = SettingsPage::get_options();
	}

	/**
	 * Returns or creates the singleton instance.
	 *
	 * @return self
	 */
	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/** Flush the singleton so option changes take effect within the same request. */
	public static function flush(): void {
		self::$instance = null;
	}

	/**
	 * Returns slugs of all enabled post types.
	 *
	 * @return string[]
	 */
	public function get_enabled_post_types(): array {
		$raw = $this->options['enabled_post_types'] ?? [];
		return is_array( $raw ) ? array_values( array_map( 'strval', $raw ) ) : [];
	}

	/**
	 * Whether NivoraX is enabled for a given post type.
	 *
	 * @param string $post_type Post type slug.
	 */
	public function is_enabled_for( string $post_type ): bool {
		return in_array( $post_type, $this->get_enabled_post_types(), true );
	}

	/** Returns the configured editor button label. */
	public function get_editor_label(): string {
		$label = (string) ( $this->options['editor_label'] ?? '' );
		return '' !== $label ? $label : __( 'Edit with NivoraX', 'nivorax' );
	}
}
