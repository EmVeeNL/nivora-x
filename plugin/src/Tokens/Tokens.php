<?php

declare( strict_types=1 );

namespace NivoraX\Tokens;

defined( 'ABSPATH' ) || exit;

/**
 * Site-wide design-token accessor.
 *
 * Tokens are stored as a JSON-encoded array under the WP option key
 * `nivorax_tokens`. The first call seeds the database with the built-in
 * defaults when no stored value exists. Each token has a stable `id` so
 * references survive renames.
 *
 * Shape of each token (mirrors app/tokens/model.ts):
 *   { id: string, group: 'color'|'typography'|'spacing'|'effect', name: string, value: mixed }
 *
 * Value types:
 *   - color       → CSS color string, e.g. "#3b82f6"
 *   - typography  → font-family CSS string, unit object, or numeric string
 *   - spacing     → unit object { value: int, unit: string }
 *   - effect      → unit object (radius) or shadow object
 */
final class Tokens {

	public const OPTION_KEY = 'nivorax_tokens';

	/**
	 * Seeded default token list.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public static function defaults(): array {
		return [
			// --- Colors ---
			[
				'id'    => 'color-primary',
				'group' => 'color',
				'name'  => 'Primary',
				'value' => '#3b82f6',
			],
			[
				'id'    => 'color-secondary',
				'group' => 'color',
				'name'  => 'Secondary',
				'value' => '#6b7280',
			],
			[
				'id'    => 'color-accent',
				'group' => 'color',
				'name'  => 'Accent',
				'value' => '#8b5cf6',
			],
			[
				'id'    => 'color-background',
				'group' => 'color',
				'name'  => 'Background',
				'value' => '#ffffff',
			],
			[
				'id'    => 'color-text',
				'group' => 'color',
				'name'  => 'Text',
				'value' => '#111827',
			],

			// --- Typography: families ---
			[
				'id'    => 'font-sans',
				'group' => 'typography',
				'name'  => 'Sans',
				'value' => 'system-ui, -apple-system, sans-serif',
			],
			[
				'id'    => 'font-serif',
				'group' => 'typography',
				'name'  => 'Serif',
				'value' => 'Georgia, serif',
			],
			[
				'id'    => 'font-mono',
				'group' => 'typography',
				'name'  => 'Mono',
				'value' => 'ui-monospace, monospace',
			],

			// --- Typography: sizes ---
			[
				'id'    => 'font-size-sm',
				'group' => 'typography',
				'name'  => 'Small',
				'value' => [
					'value' => 14,
					'unit'  => 'px',
				],
			],
			[
				'id'    => 'font-size-base',
				'group' => 'typography',
				'name'  => 'Base',
				'value' => [
					'value' => 16,
					'unit'  => 'px',
				],
			],
			[
				'id'    => 'font-size-lg',
				'group' => 'typography',
				'name'  => 'Large',
				'value' => [
					'value' => 20,
					'unit'  => 'px',
				],
			],
			[
				'id'    => 'font-size-xl',
				'group' => 'typography',
				'name'  => 'XLarge',
				'value' => [
					'value' => 24,
					'unit'  => 'px',
				],
			],

			// --- Spacing ---
			[
				'id'    => 'spacing-sm',
				'group' => 'spacing',
				'name'  => 'Small',
				'value' => [
					'value' => 8,
					'unit'  => 'px',
				],
			],
			[
				'id'    => 'spacing-md',
				'group' => 'spacing',
				'name'  => 'Medium',
				'value' => [
					'value' => 16,
					'unit'  => 'px',
				],
			],
			[
				'id'    => 'spacing-lg',
				'group' => 'spacing',
				'name'  => 'Large',
				'value' => [
					'value' => 24,
					'unit'  => 'px',
				],
			],
			[
				'id'    => 'spacing-xl',
				'group' => 'spacing',
				'name'  => 'XLarge',
				'value' => [
					'value' => 48,
					'unit'  => 'px',
				],
			],

			// --- Effects: radii ---
			[
				'id'    => 'radius-sm',
				'group' => 'effect',
				'name'  => 'Small',
				'value' => [
					'value' => 4,
					'unit'  => 'px',
				],
			],
			[
				'id'    => 'radius-md',
				'group' => 'effect',
				'name'  => 'Medium',
				'value' => [
					'value' => 8,
					'unit'  => 'px',
				],
			],
			[
				'id'    => 'radius-lg',
				'group' => 'effect',
				'name'  => 'Large',
				'value' => [
					'value' => 16,
					'unit'  => 'px',
				],
			],
		];
	}

	/**
	 * Return the current token list from the database, seeding defaults on first run.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public static function all(): array {
		$raw = get_option( self::OPTION_KEY, null );

		if ( null === $raw ) {
			$defaults = self::defaults();
			update_option( self::OPTION_KEY, $defaults );
			return $defaults;
		}

		return self::sanitize( $raw );
	}

	/**
	 * Persist a token list.
	 *
	 * @param array<int, array<string, mixed>> $tokens Token array to store.
	 * @return bool True on success.
	 */
	public static function save( array $tokens ): bool {
		$sanitized = self::sanitize( $tokens );
		return (bool) update_option( self::OPTION_KEY, $sanitized );
	}

	/**
	 * Look up a single token by id.
	 *
	 * @param string $id Token id.
	 * @return array<string, mixed>|null
	 */
	public static function find( string $id ): ?array {
		foreach ( self::all() as $token ) {
			if ( isset( $token['id'] ) && $id === $token['id'] ) {
				return $token;
			}
		}
		return null;
	}

	/**
	 * Sanitize a raw token list, discarding malformed entries.
	 *
	 * @param mixed $input Raw value from the database or request.
	 * @return array<int, array<string, mixed>>
	 */
	public static function sanitize( mixed $input ): array {
		if ( ! is_array( $input ) ) {
			return self::defaults();
		}

		$out     = [];
		$seen    = [];
		$allowed = [ 'color', 'typography', 'spacing', 'effect' ];

		foreach ( $input as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			$id    = isset( $item['id'] ) ? (string) $item['id'] : '';
			$group = isset( $item['group'] ) ? (string) $item['group'] : '';
			$name  = isset( $item['name'] ) ? (string) $item['name'] : '';

			if ( '' === $id || '' === $group || ! in_array( $group, $allowed, true ) ) {
				continue;
			}

			if ( isset( $seen[ $id ] ) ) {
				continue;
			}

			$seen[ $id ] = true;

			$out[] = [
				'id'    => sanitize_key( $id ),
				'group' => $group,
				'name'  => sanitize_text_field( $name ),
				'value' => $item['value'] ?? '',
			];
		}

		return $out;
	}
}
