<?php

declare( strict_types=1 );

namespace NivoraX\Css;

use NivoraX\Tokens\TokenCss;

defined( 'ABSPATH' ) || exit;

/**
 * PHP CSS generator — front-end cached path.
 *
 * Implements the same canonical rules as `app/css/rules.ts`:
 *  1. Scoping: `.nivorax-{id}` selector per node.
 *  2. Desktop-first: base rule covers desktop; narrower breakpoints get
 *     `@media (max-width: {width}px)` blocks.
 *  3. Only props with a concrete value are emitted.
 *  4. Output is deterministic: props follow STYLE_PROP_ORDER; breakpoints
 *     follow descending-width order.
 *  5. Token references resolve to concrete values (Phase 11 adds the manager).
 *  6. Spacing (margin/padding) expands to four longhands.
 *  7. Unit values serialise as `{value}{unit}`.
 *  8. Shadow values serialise as `{inset?} {offsetX} {offsetY} {blur} {spread} {color}`.
 */
final class CssGenerator {

	/**
	 * Style prop ordering — mirrors STYLE_PROP_ORDER in rules.ts.
	 */
	private const STYLE_PROP_ORDER = [
		'display',
		'flexDirection',
		'alignItems',
		'justifyContent',
		'gap',
		'width',
		'height',
		'minHeight',
		'maxWidth',
		'margin',
		'padding',
		'fontFamily',
		'fontSize',
		'fontWeight',
		'lineHeight',
		'color',
		'backgroundColor',
		'backgroundImage',
		'backgroundPosition',
		'backgroundSize',
		'backgroundRepeat',
		'borderStyle',
		'borderWidth',
		'borderColor',
		'borderRadius',
		'boxShadow',
	];

	/**
	 * CSS property name map — mirrors CSS_PROP_MAP in rules.ts.
	 *
	 * @var array<string, string>
	 */
	private const CSS_PROP_MAP = [
		'display'            => 'display',
		'flexDirection'      => 'flex-direction',
		'alignItems'         => 'align-items',
		'justifyContent'     => 'justify-content',
		'gap'                => 'gap',
		'width'              => 'width',
		'height'             => 'height',
		'minHeight'          => 'min-height',
		'maxWidth'           => 'max-width',
		'marginTop'          => 'margin-top',
		'marginRight'        => 'margin-right',
		'marginBottom'       => 'margin-bottom',
		'marginLeft'         => 'margin-left',
		'paddingTop'         => 'padding-top',
		'paddingRight'       => 'padding-right',
		'paddingBottom'      => 'padding-bottom',
		'paddingLeft'        => 'padding-left',
		'fontFamily'         => 'font-family',
		'fontSize'           => 'font-size',
		'fontWeight'         => 'font-weight',
		'lineHeight'         => 'line-height',
		'color'              => 'color',
		'backgroundColor'    => 'background-color',
		'backgroundImage'    => 'background-image',
		'backgroundPosition' => 'background-position',
		'backgroundSize'     => 'background-size',
		'backgroundRepeat'   => 'background-repeat',
		'borderStyle'        => 'border-style',
		'borderWidth'        => 'border-width',
		'borderColor'        => 'border-color',
		'borderRadius'       => 'border-radius',
		'boxShadow'          => 'box-shadow',
	];

	/**
	 * Generate scoped CSS for a document tree.
	 *
	 * When $tokens is supplied, a :root{--nx-*} variables block is prepended
	 * so token references (var(--nx-{id})) cascade correctly.
	 *
	 * @param object                           $tree        Decoded tree ({ rootId, nodes }).
	 * @param array<int, array<string, mixed>> $breakpoints Ordered breakpoint list (desktop first).
	 * @param array<int, array<string, mixed>> $tokens      Optional token list (from Tokens::all()).
	 * @return string Complete CSS string.
	 */
	public function generate( object $tree, array $breakpoints, array $tokens = [] ): string {
		$nodes = (array) ( $tree->nodes ?? new \stdClass() );

		if ( empty( $nodes ) ) {
			return '';
		}

		$parts        = [];
		$media_blocks = [];

		// Prepend token variables block when tokens are supplied.
		if ( ! empty( $tokens ) ) {
			$vars = TokenCss::to_css_vars( $tokens );
			if ( '' !== $vars ) {
				$parts[] = $vars;
			}
		}

		foreach ( $nodes as $node ) {
			if ( ! is_object( $node ) ) {
				continue;
			}

			[ 'base' => $base, 'overrides' => $overrides ] = $this->generate_node_css( $node, $breakpoints );

			if ( '' !== $base ) {
				$parts[] = $base;
			}

			foreach ( $overrides as $bp_id => $block ) {
				$media_blocks[ $bp_id ][] = $block;
			}
		}

		// Emit @media blocks — non-desktop breakpoints, descending width order.
		$non_desktop = array_slice( $breakpoints, 1 );
		usort(
			$non_desktop,
			static fn( array $a, array $b ) => $b['width'] <=> $a['width']
		);

		foreach ( $non_desktop as $bp ) {
			$bp_id  = (string) ( $bp['id'] ?? '' );
			$blocks = $media_blocks[ $bp_id ] ?? [];
			if ( ! empty( $blocks ) ) {
				$width   = (int) $bp['width'];
				$parts[] = "@media (max-width:{$width}px){" . implode( '', $blocks ) . '}';
			}
		}

		return implode( '', $parts );
	}

	/**
	 * Generate CSS for a single node.
	 *
	 * @param object                           $node        Decoded node object.
	 * @param array<int, array<string, mixed>> $breakpoints Ordered breakpoint list.
	 * @return array{ base: string, overrides: array<string, string> }
	 */
	private function generate_node_css( object $node, array $breakpoints ): array {
		$id       = (string) ( $node->id ?? '' );
		$selector = ".nivorax-{$id}";
		$props    = (object) ( $node->props ?? new \stdClass() );

		// Base (desktop) declarations.
		$base_decls = $this->node_base_declarations( $props );
		$base       = ! empty( $base_decls ) ? "{$selector}{" . $this->build_block( $base_decls ) . '}' : '';

		// Per-breakpoint override declarations.
		$overrides = [];
		foreach ( array_slice( $breakpoints, 1 ) as $bp ) {
			$bp_id  = (string) ( $bp['id'] ?? '' );
			$raw_ov = $node->overrides ?? [];
			$ov_obj = is_object( $raw_ov ) ? $raw_ov : (object) $raw_ov;
			$decls  = $this->node_override_declarations( $props, $ov_obj, $bp_id );
			if ( ! empty( $decls ) ) {
				$overrides[ $bp_id ] = "{$selector}{" . $this->build_block( $decls ) . '}';
			}
		}

		return [
			'base'      => $base,
			'overrides' => $overrides,
		];
	}

	/**
	 * Extract base (desktop) declarations from node props.
	 *
	 * @param object $props Node props object.
	 * @return array<array{string, string}>
	 */
	private function node_base_declarations( object $props ): array {
		$decls = [];
		foreach ( self::STYLE_PROP_ORDER as $prop ) {
			$raw   = $props->$prop ?? null;
			$value = $this->resolve_token_ref( $this->base_value( $raw ) );
			array_push( $decls, ...$this->prop_to_declarations( $prop, $value ) );
		}
		return $decls;
	}

	/**
	 * Extract breakpoint-specific override declarations.
	 *
	 * @param object $props     Node props object.
	 * @param object $overrides Node overrides object.
	 * @param string $bp_id     Breakpoint ID to extract.
	 * @return array<array{string, string}>
	 */
	private function node_override_declarations( object $props, object $overrides, string $bp_id ): array {
		$decls = [];

		// Responsive style props stored in node.props as { base, [bp]: value }.
		foreach ( self::STYLE_PROP_ORDER as $prop ) {
			$raw   = $props->$prop ?? null;
			$value = $this->override_value( $raw, $bp_id );
			if ( null !== $value ) {
				array_push( $decls, ...$this->prop_to_declarations( $prop, $this->resolve_token_ref( $value ) ) );
			}
		}

		// node.overrides[bp_id] — direct per-breakpoint overrides.
		$bp_overrides = $overrides->$bp_id ?? null;
		if ( is_object( $bp_overrides ) ) {
			foreach ( self::STYLE_PROP_ORDER as $prop ) {
				$value = $bp_overrides->$prop ?? null;
				if ( null !== $value ) {
					array_push( $decls, ...$this->prop_to_declarations( $prop, $this->resolve_token_ref( $value ) ) );
				}
			}
		}

		return $decls;
	}

	/**
	 * Detect a token reference: { __token: string }.
	 *
	 * @param mixed $value Candidate value.
	 * @return bool True when the value is a token reference.
	 */
	private function is_token_ref( mixed $value ): bool {
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		return is_object( $value ) && isset( $value->__token ) && is_string( $value->__token );
	}

	/**
	 * Resolve a token reference to var(--nx-{id}), or return the value unchanged.
	 *
	 * @param mixed $value Style prop value (may be a token ref or a raw value).
	 * @return mixed Resolved value.
	 */
	private function resolve_token_ref( mixed $value ): mixed {
		if ( $this->is_token_ref( $value ) ) {
			// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
			return "var(--nx-{$value->__token})";
		}
		return $value;
	}

	/**
	 * Extract the base (desktop) value from a prop that may be a responsive object.
	 *
	 * @param mixed $raw Raw prop value from decoded JSON.
	 * @return mixed Concrete base value, or the raw value if not responsive.
	 */
	private function base_value( mixed $raw ): mixed {
		$default_state = $this->default_state_value( $raw );
		if ( is_object( $default_state ) && isset( $default_state->base ) ) {
			return $default_state->base;
		}
		return $default_state;
	}

	/**
	 * Extract a breakpoint-specific override value from a responsive prop object.
	 *
	 * @param mixed  $raw   Raw prop value.
	 * @param string $bp_id Breakpoint ID.
	 * @return mixed Override value, or null when not set.
	 */
	private function override_value( mixed $raw, string $bp_id ): mixed {
		$default_state = $this->default_state_value( $raw );
		if ( ! is_object( $default_state ) || ! isset( $default_state->base ) ) {
			return null;
		}
		return $default_state->$bp_id ?? null;
	}

	/**
	 * Extract the Phase 12 default-state payload from a style value.
	 *
	 * Legacy values are returned unchanged so pre-Phase-12 documents stay valid.
	 *
	 * @param mixed $raw Raw prop value.
	 * @return mixed Default-state value or the legacy raw value.
	 */
	private function default_state_value( mixed $raw ): mixed {
		if ( ! is_object( $raw ) ) {
			return $raw;
		}

		$keys = array_keys( get_object_vars( $raw ) );
		if ( empty( $keys ) ) {
			return $raw;
		}

		$state_keys = [ 'default', 'hover', 'focus', 'active' ];
		foreach ( $keys as $key ) {
			if ( ! in_array( $key, $state_keys, true ) ) {
				return $raw;
			}
		}

		return $raw->default ?? null;
	}

	/**
	 * Serialize a prop and its value to CSS declaration tuples.
	 *
	 * @param string $prop  Style prop name (camelCase, from STYLE_PROP_ORDER).
	 * @param mixed  $value Decoded prop value.
	 * @return array<array{string, string}>
	 */
	private function prop_to_declarations( string $prop, mixed $value ): array {
		if ( null === $value ) {
			return [];
		}

		if ( 'margin' === $prop || 'padding' === $prop ) {
			return $this->expand_spacing( $prop, $value );
		}

		if ( 'borderWidth' === $prop || 'borderColor' === $prop ) {
			$expanded = $this->expand_border_sides( $prop, $value );
			if ( ! empty( $expanded ) ) {
				return $expanded;
			}
		}

		if ( 'borderRadius' === $prop ) {
			$expanded = $this->expand_border_radius( $value );
			if ( ! empty( $expanded ) ) {
				return $expanded;
			}
		}

		if ( 'backgroundImage' === $prop ) {
			$background_image = $this->normalize_background_image( $value );
			if ( null === $background_image ) {
				return [];
			}

			$css_prop = self::CSS_PROP_MAP['backgroundImage'];

			return [ [ $css_prop, $background_image ] ];
		}

		$css_value = $this->to_css_string( $value );
		if ( null === $css_value ) {
			return [];
		}

		$css_prop = self::CSS_PROP_MAP[ $prop ] ?? null;
		if ( null === $css_prop ) {
			return [];
		}

		return [ [ $css_prop, $css_value ] ];
	}

	/**
	 * Expand a spacing value to four margin/padding longhands.
	 *
	 * @param string $prop  'margin' or 'padding'.
	 * @param mixed  $value Spacing object or non-expandable value.
	 * @return array<array{string, string}>
	 */
	private function expand_spacing( string $prop, mixed $value ): array {
		if ( ! is_object( $value ) ) {
			return [];
		}

		$sides = [ 'top', 'right', 'bottom', 'left' ];
		$decls = [];

		foreach ( $sides as $side ) {
			$side_value = $value->$side ?? null;
			$css_value  = $this->unit_value_to_css( $side_value );
			if ( null !== $css_value ) {
				$decls[] = [ "{$prop}-{$side}", $css_value ];
			}
		}

		// Only return if all four sides resolved (consistent with JS generator).
		return count( $decls ) === 4 ? $decls : [];
	}

	/**
	 * Expand per-side border width/color objects to longhand declarations.
	 *
	 * @param string $prop  borderWidth or borderColor.
	 * @param mixed  $value Side object.
	 * @return array<array{string, string}>
	 */
	private function expand_border_sides( string $prop, mixed $value ): array {
		if ( ! is_object( $value ) ) {
			return [];
		}

		$sides = [ 'top', 'right', 'bottom', 'left' ];
		$decls = [];

		foreach ( $sides as $side ) {
			$side_value = $value->$side ?? null;

			if ( 'borderWidth' === $prop ) {
				$css_value = $this->unit_value_to_css( $side_value );
				if ( null === $css_value ) {
					return [];
				}
				$decls[] = [ "border-{$side}-width", $css_value ];
				continue;
			}

			if ( ! is_string( $side_value ) ) {
				return [];
			}

			$decls[] = [ "border-{$side}-color", $side_value ];
		}

		return $decls;
	}

	/**
	 * Expand per-corner border radius objects to longhand declarations.
	 *
	 * @param mixed $value Corner object.
	 * @return array<array{string, string}>
	 */
	private function expand_border_radius( mixed $value ): array {
		if ( ! is_object( $value ) ) {
			return [];
		}

		$corners = [
			'topLeft'     => 'border-top-left-radius',
			'topRight'    => 'border-top-right-radius',
			'bottomRight' => 'border-bottom-right-radius',
			'bottomLeft'  => 'border-bottom-left-radius',
		];
		$decls   = [];

		foreach ( $corners as $corner => $css_prop ) {
			$corner_value = $value->$corner ?? null;
			$css_value    = $this->unit_value_to_css( $corner_value );
			if ( null === $css_value ) {
				return [];
			}

			$decls[] = [ $css_prop, $css_value ];
		}

		return $decls;
	}

	/**
	 * Serialise a decoded JSON value to a CSS string.
	 *
	 * @param mixed $value Decoded value (string, number, unit object, or shadow object).
	 * @return string|null CSS string, or null when the value cannot be serialised.
	 */
	private function to_css_string( mixed $value ): ?string {
		if ( null === $value || '' === $value ) {
			return null;
		}

		// Unit value: { value: number, unit: string }.
		$unit_css = $this->unit_value_to_css( $value );
		if ( null !== $unit_css ) {
			return $unit_css;
		}

		// Shadow value: { offsetX, offsetY, blur, spread, color, inset? }.
		if ( $this->is_shadow_value( $value ) ) {
			return $this->shadow_to_css( $value );
		}

		if ( is_string( $value ) ) {
			return $value;
		}

		if ( is_numeric( $value ) ) {
			return (string) $value;
		}

		return null;
	}

	/**
	 * Serialise a unit value object to a CSS string (e.g. `24px`, `1.5rem`).
	 *
	 * @param mixed $value Candidate value.
	 * @return string|null CSS string or null if not a unit value.
	 */
	private function unit_value_to_css( mixed $value ): ?string {
		if (
			is_object( $value )
			&& is_numeric( $value->value ?? null )
			&& is_string( $value->unit ?? null )
			&& '' !== $value->unit
		) {
			return ( (string) $value->value ) . $value->unit;
		}
		return null;
	}

	/**
	 * Whether a value is a shadow object.
	 *
	 * @param mixed $value Candidate value.
	 * @return bool
	 */
	private function is_shadow_value( mixed $value ): bool {
		return is_object( $value )
			&& isset( $value->offsetX, $value->offsetY, $value->blur, $value->spread ); // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	}

	/**
	 * Serialise a shadow value to a CSS box-shadow string.
	 *
	 * @param object $value Shadow value object.
	 * @return string CSS box-shadow value.
	 */
	private function shadow_to_css( object $value ): string {
		$parts = [];

		if ( ! empty( $value->inset ) ) {
			$parts[] = 'inset';
		}

		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$parts[] = $this->unit_value_to_css( $value->offsetX ) ?? '0px';
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$parts[] = $this->unit_value_to_css( $value->offsetY ) ?? '0px';
		$parts[] = $this->unit_value_to_css( $value->blur ) ?? '0px';
		$parts[] = $this->unit_value_to_css( $value->spread ) ?? '0px';
		$parts[] = is_string( $value->color ?? null ) ? $value->color : 'rgba(0,0,0,0.2)';

		return implode( ' ', $parts );
	}

	/**
	 * Build a CSS declaration block string from declaration tuples.
	 *
	 * @param array<array{string, string}> $declarations Array of [property, value] tuples.
	 * @return string e.g. `color:red;display:block`.
	 */
	private function build_block( array $declarations ): string {
		return implode(
			';',
			array_map(
				static fn( array $pair ) => "{$pair[0]}:{$pair[1]}",
				$declarations
			)
		);
	}

	/**
	 * Normalize background image input into valid CSS.
	 *
	 * Accepts raw CSS functions like `url(...)` or gradients directly; all other
	 * non-empty strings are treated as plain URLs and wrapped in `url("...")`.
	 *
	 * @param mixed $value Candidate value.
	 * @return string|null
	 */
	private function normalize_background_image( mixed $value ): ?string {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$trimmed = trim( $value );
		if ( '' === $trimmed ) {
			return null;
		}

		foreach ( [ 'url(', 'linear-gradient(', 'radial-gradient(', 'conic-gradient(' ] as $prefix ) {
			if ( str_starts_with( $trimmed, $prefix ) ) {
				return $trimmed;
			}
		}

		return 'url("' . str_replace( '"', '\"', $trimmed ) . '")';
	}
}
