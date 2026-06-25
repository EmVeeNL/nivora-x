<?php

declare( strict_types=1 );

namespace NivoraX\Tokens;

defined( 'ABSPATH' ) || exit;

/**
 * Converts the site-wide token set to CSS custom properties.
 *
 * Mirrors app/tokens/cssVars.ts: each token emits `--nx-{id}: {value}`.
 * The block is prepended to every generated stylesheet so `var(--nx-{id})`
 * references cascade on both the editor canvas and the front end.
 */
final class TokenCss {

	/**
	 * Serialise a token value to a CSS string.
	 *
	 * Supports the three stored forms:
	 *   - plain string (color hex or font-family CSS)
	 *   - unit-value array ['value' => numeric, 'unit' => string]
	 *   - unit-value object { value: numeric, unit: string }
	 *
	 * @param mixed $value Token value as stored by Tokens::all().
	 * @return string CSS string, or empty string if value cannot be serialised.
	 */
	public static function value_to_css( mixed $value ): string {
		if ( is_string( $value ) ) {
			return $value;
		}

		// Array unit-value (PHP option storage).
		if (
			is_array( $value )
			&& isset( $value['value'], $value['unit'] )
			&& is_numeric( $value['value'] )
			&& is_string( $value['unit'] )
		) {
			return ( (string) $value['value'] ) . $value['unit'];
		}

		// Object unit-value (JSON-decoded).
		if (
			is_object( $value )
			&& is_numeric( $value->value ?? null )
			&& is_string( $value->unit ?? null )
		) {
			return ( (string) $value->value ) . $value->unit; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		}

		return '';
	}

	/**
	 * Emit a :root CSS custom property block for the given token list.
	 *
	 * Returns an empty string when the list is empty or no tokens serialise.
	 *
	 * @param array<int, array<string, mixed>> $tokens Token list from Tokens::all().
	 * @return string e.g. ':root{--nx-color-primary:#3b82f6;--nx-spacing-md:16px}'
	 */
	public static function to_css_vars( array $tokens ): string {
		if ( empty( $tokens ) ) {
			return '';
		}

		$vars = [];

		foreach ( $tokens as $token ) {
			$id  = isset( $token['id'] ) ? (string) $token['id'] : '';
			$val = $token['value'] ?? '';

			if ( '' === $id ) {
				continue;
			}

			$css = self::value_to_css( $val );
			if ( '' !== $css ) {
				$vars[] = "--nx-{$id}:{$css}";
			}
		}

		if ( empty( $vars ) ) {
			return '';
		}

		return ':root{' . implode( ';', $vars ) . '}';
	}
}
