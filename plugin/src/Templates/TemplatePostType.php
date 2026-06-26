<?php

declare( strict_types=1 );

namespace NivoraX\Templates;

defined( 'ABSPATH' ) || exit;

/**
 * Registers the `nivorax_template` custom post type that stores theme-builder
 * templates (headers, footers, singles, archives, 404, search).
 *
 * Templates are documents — they reuse the Phase 04 envelope stored in the
 * shared `_nivorax_data` post meta — plus theme-builder metadata (type +
 * conditions) handled by {@see TemplateModel}. The CPT is intentionally hidden
 * from the default WP admin UI: templates are created and edited through the
 * NivoraX editor and the dedicated "All Templates" screen.
 */
final class TemplatePostType {

	/** Custom post type slug for NivoraX templates. */
	public const POST_TYPE = 'nivorax_template';

	/** Hooks CPT + metadata registration onto `init`. */
	public static function register(): void {
		add_action( 'init', [ self::class, 'register_post_type' ] );
		add_action( 'init', [ TemplateModel::class, 'register_meta' ] );
	}

	/** Registers the `nivorax_template` post type. */
	public static function register_post_type(): void {
		register_post_type(
			self::POST_TYPE,
			[
				'labels'              => [
					'name'          => __( 'Templates', 'nivorax' ),
					'singular_name' => __( 'Template', 'nivorax' ),
				],
				// Hidden from the native admin — managed via the NivoraX editor + screen.
				'public'              => false,
				'publicly_queryable'  => false,
				'show_ui'             => false,
				'show_in_menu'        => false,
				'show_in_rest'        => false,
				'exclude_from_search' => true,
				'has_archive'         => false,
				'hierarchical'        => false,
				'rewrite'             => false,
				'query_var'           => false,
				'capability_type'     => 'page',
				'map_meta_cap'        => true,
				'supports'            => [ 'title' ],
			]
		);
	}
}
