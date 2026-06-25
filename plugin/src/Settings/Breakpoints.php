<?php

declare( strict_types=1 );

namespace NivoraX\Settings;

use NivoraX\Admin\Settings\SettingsPage;

defined( 'ABSPATH' ) || exit;

/**
 * Typed site-wide breakpoint accessor.
 */
final class Breakpoints {

	/**
	 * Built-in breakpoint definitions.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	private static function builtin_map(): array {
		return [
			'desktop' => [
				'id'        => 'desktop',
				'label'     => 'Desktop',
				'width'     => 1440,
				'direction' => 'max',
				'builtin'   => true,
			],
			'tablet'  => [
				'id'        => 'tablet',
				'label'     => 'Tablet',
				'width'     => 768,
				'direction' => 'max',
				'builtin'   => true,
			],
			'mobile'  => [
				'id'        => 'mobile',
				'label'     => 'Mobile',
				'width'     => 375,
				'direction' => 'max',
				'builtin'   => true,
			],
		];
	}

	/**
	 * Default ordered breakpoint list.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public static function defaults(): array {
		return array_values( self::builtin_map() );
	}

	/**
	 * Return the normalized breakpoint list from plugin options.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public static function all(): array {
		$options = SettingsPage::get_options();
		$raw     = $options['breakpoints'] ?? self::defaults();

		return self::sanitize_option( $raw );
	}

	/**
	 * Sanitize raw option payload into a stable ordered breakpoint list.
	 *
	 * Desktop is always first; all narrower breakpoints are sorted by width descending.
	 *
	 * @param mixed $input Raw breakpoint payload.
	 * @return array<int, array<string, mixed>>
	 */
	public static function sanitize_option( mixed $input ): array {
		$rows     = is_array( $input ) ? $input : [];
		$builtins = self::builtin_map();
		$others   = [];
		$seen_ids = array_fill_keys( array_keys( $builtins ), true );

		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}

			$id = sanitize_key( (string) ( $row['id'] ?? '' ) );
			if ( isset( $builtins[ $id ] ) ) {
				$builtins[ $id ] = self::sanitize_row( $row, $builtins[ $id ] );
				continue;
			}

			if ( '' === $id || isset( $seen_ids[ $id ] ) ) {
				continue;
			}

			$width = absint( $row['width'] ?? 0 );
			if ( $width <= 0 ) {
				continue;
			}

			$seen_ids[ $id ] = true;
			$others[]        = self::sanitize_row(
				$row,
				[
					'id'        => $id,
					'label'     => self::humanize_id( $id ),
					'width'     => $width,
					'direction' => 'max',
					'builtin'   => false,
				]
			);
		}

		$others[] = $builtins['tablet'];
		$others[] = $builtins['mobile'];

		usort(
			$others,
			static function ( array $left, array $right ): int {
				$width_compare = $right['width'] <=> $left['width'];
				if ( 0 !== $width_compare ) {
					return $width_compare;
				}

				return strcmp( (string) $left['label'], (string) $right['label'] );
			}
		);

		return array_merge(
			[ $builtins['desktop'] ],
			$others
		);
	}

	/**
	 * Sanitize one breakpoint row against a normalized fallback.
	 *
	 * @param array<string, mixed> $row      Raw breakpoint row.
	 * @param array<string, mixed> $fallback Normalized builtin or custom fallback definition.
	 * @return array<string, mixed>
	 */
	private static function sanitize_row( array $row, array $fallback ): array {
		$label = sanitize_text_field( (string) ( $row['label'] ?? '' ) );
		$width = absint( $row['width'] ?? $fallback['width'] );

		return [
			'id'        => (string) $fallback['id'],
			'label'     => '' !== $label ? $label : (string) $fallback['label'],
			'width'     => $width > 0 ? $width : (int) $fallback['width'],
			'direction' => 'max',
			'builtin'   => (bool) $fallback['builtin'],
		];
	}

	/**
	 * Build a readable default label from a breakpoint id.
	 *
	 * @param string $id Breakpoint id slug.
	 */
	private static function humanize_id( string $id ): string {
		$spaced = str_replace( [ '-', '_' ], ' ', $id );
		return ucwords( $spaced );
	}
}
