<?php

declare( strict_types=1 );

namespace NivoraX\Admin\Settings;

use NivoraX\Settings\Breakpoints;

defined( 'ABSPATH' ) || exit;

/**
 * Registers NivoraX settings with the WordPress Settings API.
 */
final class SettingsPage {

	public const OPTION_GROUP = 'nivorax_settings';
	public const PAGE_SLUG    = 'nivorax-settings';
	public const OPTION_KEY   = 'nivorax_options';

	/** Hooks admin_init to register plugin settings with the Settings API. */
	public static function register(): void {
		add_action( 'admin_init', [ self::class, 'register_settings' ] );
	}

	/** Registers sections, fields, and the setting group. */
	public static function register_settings(): void {
		register_setting(
			self::OPTION_GROUP,
			self::OPTION_KEY,
			[
				'type'              => 'array',
				'sanitize_callback' => [ self::class, 'sanitize' ],
				'default'           => self::defaults(),
			]
		);

		// Section: Post types.
		add_settings_section(
			'nivorax_post_types',
			__( 'Enabled Post Types', 'nivorax' ),
			static function (): void {
				echo '<p>' . esc_html__( 'Choose which post types NivoraX is available on.', 'nivorax' ) . '</p>';
			},
			self::PAGE_SLUG
		);

		add_settings_field(
			'enabled_post_types',
			__( 'Post Types', 'nivorax' ),
			[ self::class, 'render_post_types_field' ],
			self::PAGE_SLUG,
			'nivorax_post_types'
		);

		// Section: General (placeholder for future options).
		add_settings_section(
			'nivorax_general',
			__( 'General', 'nivorax' ),
			static function (): void {
				echo '<p>' . esc_html__( 'General NivoraX options.', 'nivorax' ) . '</p>';
			},
			self::PAGE_SLUG
		);

		add_settings_field(
			'editor_label',
			__( 'Editor label', 'nivorax' ),
			[ self::class, 'render_editor_label_field' ],
			self::PAGE_SLUG,
			'nivorax_general'
		);
	}

	/** Renders the enabled post types checkbox list. */
	public static function render_post_types_field(): void {
		$options      = self::get_options();
		$enabled      = (array) ( $options['enabled_post_types'] ?? [] );
		$public_types = self::get_eligible_post_types();

		foreach ( $public_types as $post_type_obj ) {
			$slug    = $post_type_obj->name;
			$label   = $post_type_obj->label;
			$checked = in_array( $slug, $enabled, true );
			printf(
				'<label><input type="checkbox" name="%s[enabled_post_types][]" value="%s" %s> %s</label><br>',
				esc_attr( self::OPTION_KEY ),
				esc_attr( $slug ),
				checked( $checked, true, false ),
				esc_html( $label )
			);
		}
	}

	/** Renders the editor label text input. */
	public static function render_editor_label_field(): void {
		$options = self::get_options();
		$value   = (string) ( $options['editor_label'] ?? '' );
		printf(
			'<input type="text" name="%s[editor_label]" value="%s" class="regular-text" placeholder="%s">',
			esc_attr( self::OPTION_KEY ),
			esc_attr( $value ),
			esc_attr__( 'Edit with NivoraX', 'nivorax' )
		);
	}

	/**
	 * Sanitize incoming option values.
	 *
	 * @param mixed $input Raw form data.
	 * @return array<string, mixed>
	 */
	public static function sanitize( mixed $input ): array {
		if ( ! is_array( $input ) ) {
			return self::defaults();
		}

		$eligible_slugs = array_map(
			static fn( object $t ) => $t->name,
			self::get_eligible_post_types()
		);

		$raw_types = isset( $input['enabled_post_types'] ) && is_array( $input['enabled_post_types'] )
			? $input['enabled_post_types']
			: [];

		$enabled = array_values(
			array_intersect(
				array_map( 'sanitize_key', $raw_types ),
				$eligible_slugs
			)
		);

		return [
			'enabled_post_types' => $enabled,
			'editor_label'       => sanitize_text_field( (string) ( $input['editor_label'] ?? '' ) ),
			'breakpoints'        => Breakpoints::sanitize_option( $input['breakpoints'] ?? [] ),
		];
	}

	/**
	 * Returns the default option values.
	 *
	 * @return array<string, mixed>
	 */
	public static function defaults(): array {
		return [
			'enabled_post_types' => [ 'page' ],
			'editor_label'       => '',
			'breakpoints'        => Breakpoints::defaults(),
		];
	}

	/**
	 * Returns the stored option values merged with defaults.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_options(): array {
		$raw = get_option( self::OPTION_KEY, self::defaults() );
		return is_array( $raw ) ? $raw : self::defaults();
	}

	/**
	 * Returns public, eligible post types (excludes attachment and nav_menu_item).
	 *
	 * @return \WP_Post_Type[]
	 */
	public static function get_eligible_post_types(): array {
		$exclude = [ 'attachment', 'nav_menu_item', 'revision', 'custom_css', 'customize_changeset', 'oembed_cache', 'user_request', 'wp_block', 'wp_template', 'wp_template_part', 'wp_global_styles', 'wp_navigation' ];

		$types = get_post_types( [ 'public' => true ], 'objects' );

		return array_values(
			array_filter(
				$types,
				static fn( object $t ) => ! in_array( $t->name, $exclude, true )
			)
		);
	}
}
