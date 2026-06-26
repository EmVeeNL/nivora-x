<?php

declare( strict_types=1 );

namespace NivoraX\Templates;

use NivoraX\Capabilities\Capabilities;

defined( 'ABSPATH' ) || exit;

/**
 * Type + conditions metadata for `nivorax_template` posts.
 *
 * A template's document content lives in the shared Phase 04 envelope
 * (`_nivorax_data`); this model owns the two theme-builder-specific meta keys:
 *
 * - **type** — which slot the template fills (header/footer/single/…).
 * - **conditions** — a structured rules array the Phase 13 task 004 resolver
 *   consumes to decide where a template applies.
 *
 * ## Conditions payload
 *
 * Conditions are a flat list of rules. Each rule is:
 *
 * ```
 * [ 'behavior' => 'include'|'exclude', 'object' => <object>, 'value' => string ]
 * ```
 *
 * The `object` is one of {@see self::valid_objects()}; `value` qualifies it
 * (e.g. a post-type slug, a post id, or `taxonomy:term_id`). `entire_site`
 * ignores `value`. The resolver (task 004) ranks matches by specificity:
 * `singular` > `taxonomy` > `post_type`/`archive` > `entire_site`.
 *
 * @phpstan-type ConditionRule array{behavior: string, object: string, value: string}
 */
final class TemplateModel {

	/** Meta key holding the template type. */
	public const TYPE_META = '_nivorax_template_type';

	/** Meta key holding the JSON-encoded conditions payload. */
	public const CONDITIONS_META = '_nivorax_template_conditions';

	public const TYPE_HEADER  = 'header';
	public const TYPE_FOOTER  = 'footer';
	public const TYPE_SINGLE  = 'single';
	public const TYPE_ARCHIVE = 'archive';
	public const TYPE_404     = '404';
	public const TYPE_SEARCH  = 'search';

	public const BEHAVIOR_INCLUDE = 'include';
	public const BEHAVIOR_EXCLUDE = 'exclude';

	public const OBJECT_ENTIRE_SITE = 'entire_site';
	public const OBJECT_POST_TYPE   = 'post_type';
	public const OBJECT_SINGULAR    = 'singular';
	public const OBJECT_TAXONOMY    = 'taxonomy';
	public const OBJECT_ARCHIVE     = 'archive';

	/** Registers the type + conditions post meta with WordPress. */
	public static function register_meta(): void {
		$auth = static fn(): bool => Capabilities::current_user_can_edit();

		register_post_meta(
			TemplatePostType::POST_TYPE,
			self::TYPE_META,
			[
				'type'          => 'string',
				'single'        => true,
				'show_in_rest'  => false,
				'auth_callback' => $auth,
			]
		);

		register_post_meta(
			TemplatePostType::POST_TYPE,
			self::CONDITIONS_META,
			[
				'type'          => 'string',
				'single'        => true,
				'show_in_rest'  => false,
				'auth_callback' => $auth,
			]
		);
	}

	/**
	 * The supported template types.
	 *
	 * @return list<string>
	 */
	public static function valid_types(): array {
		return [
			self::TYPE_HEADER,
			self::TYPE_FOOTER,
			self::TYPE_SINGLE,
			self::TYPE_ARCHIVE,
			self::TYPE_404,
			self::TYPE_SEARCH,
		];
	}

	/**
	 * Whether the given value is a supported template type.
	 *
	 * @param mixed $type Candidate type.
	 */
	public static function is_valid_type( mixed $type ): bool {
		return is_string( $type ) && in_array( $type, self::valid_types(), true );
	}

	/**
	 * The supported condition object types.
	 *
	 * @return list<string>
	 */
	public static function valid_objects(): array {
		return [
			self::OBJECT_ENTIRE_SITE,
			self::OBJECT_POST_TYPE,
			self::OBJECT_SINGULAR,
			self::OBJECT_TAXONOMY,
			self::OBJECT_ARCHIVE,
		];
	}

	/**
	 * Read the template type for a post. Empty string when unset/invalid.
	 *
	 * @param int $post_id Template post ID.
	 */
	public static function get_type( int $post_id ): string {
		$value = get_post_meta( $post_id, self::TYPE_META, true );
		return self::is_valid_type( $value ) ? (string) $value : '';
	}

	/**
	 * Persist the template type. Rejects unsupported types.
	 *
	 * @param int    $post_id Template post ID.
	 * @param string $type    One of {@see self::valid_types()}.
	 */
	public static function set_type( int $post_id, string $type ): bool {
		if ( ! self::is_valid_type( $type ) ) {
			return false;
		}
		if ( ! Capabilities::user_can_edit_post( $post_id ) ) {
			return false;
		}
		return false !== update_post_meta( $post_id, self::TYPE_META, $type );
	}

	/**
	 * Read the normalized conditions rules for a template.
	 *
	 * @param int $post_id Template post ID.
	 * @return list<ConditionRule>
	 */
	public static function get_conditions( int $post_id ): array {
		$raw = get_post_meta( $post_id, self::CONDITIONS_META, true );
		if ( ! is_string( $raw ) || '' === $raw ) {
			return [];
		}
		$decoded = json_decode( $raw, true );
		return self::normalize_conditions( $decoded );
	}

	/**
	 * Persist conditions for a template after normalizing them.
	 *
	 * @param int   $post_id    Template post ID.
	 * @param mixed $conditions Raw conditions payload (array of rules).
	 */
	public static function set_conditions( int $post_id, mixed $conditions ): bool {
		if ( ! Capabilities::user_can_edit_post( $post_id ) ) {
			return false;
		}
		$normalized = self::normalize_conditions( $conditions );
		$encoded    = wp_json_encode( $normalized );
		if ( false === $encoded ) {
			return false;
		}
		return false !== update_post_meta( $post_id, self::CONDITIONS_META, $encoded );
	}

	/**
	 * Validate + coerce an arbitrary payload into a clean rules list.
	 *
	 * Invalid rules are dropped; `entire_site` rules have their value cleared.
	 *
	 * @param mixed $conditions Raw conditions payload.
	 * @return list<ConditionRule>
	 */
	public static function normalize_conditions( mixed $conditions ): array {
		if ( ! is_array( $conditions ) ) {
			return [];
		}

		$rules = [];
		foreach ( $conditions as $rule ) {
			if ( ! is_array( $rule ) ) {
				continue;
			}

			$object = isset( $rule['object'] ) && is_string( $rule['object'] ) ? $rule['object'] : '';
			if ( ! in_array( $object, self::valid_objects(), true ) ) {
				continue;
			}

			$behavior = isset( $rule['behavior'] ) && self::BEHAVIOR_EXCLUDE === $rule['behavior']
				? self::BEHAVIOR_EXCLUDE
				: self::BEHAVIOR_INCLUDE;

			$value = isset( $rule['value'] ) && ( is_string( $rule['value'] ) || is_int( $rule['value'] ) )
				? (string) $rule['value']
				: '';

			// entire_site applies unconditionally — value is meaningless.
			if ( self::OBJECT_ENTIRE_SITE === $object ) {
				$value = '';
			}

			$rules[] = [
				'behavior' => $behavior,
				'object'   => $object,
				'value'    => $value,
			];
		}

		return $rules;
	}
}
