<?php

declare( strict_types=1 );

namespace NivoraX\Tests\Unit\Css;

use NivoraX\Css\CssGenerator;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal stdClass tree for testing.
 *
 * @param array<string, array<string, mixed>> $nodes_data Keys are node IDs.
 * @param string                              $root_id    Root node ID.
 */
function make_gen_tree( array $nodes_data, string $root_id = '' ): \stdClass {
	$nodes = new \stdClass();
	foreach ( $nodes_data as $id => $data ) {
		$node            = new \stdClass();
		$node->id        = $id;
		$node->type      = $data['type'] ?? 'section';
		$node->props     = json_decode( (string) json_encode( $data['props'] ?? [] ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode
		$node->children  = $data['children'] ?? [];
		$node->overrides = json_decode( (string) json_encode( $data['overrides'] ?? [] ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode
		$nodes->$id      = $node;
	}

	$tree         = new \stdClass();
	$first        = array_key_first( $nodes_data ) ?? '';
	$tree->rootId = '' !== $root_id ? $root_id : $first; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	$tree->nodes  = $nodes;
	return $tree;
}

/**
 * Build a breakpoint config array.
 *
 * @param string $id    Breakpoint ID.
 * @param string $label Display label.
 * @param int    $width Max-width in pixels.
 * @return array<string, mixed>
 */
function make_bp( string $id, string $label, int $width ): array {
	return [
		'id'        => $id,
		'label'     => $label,
		'width'     => $width,
		'direction' => 'max',
		'builtin'   => true,
	];
}

$breakpoints = [
	make_bp( 'desktop', 'Desktop', 1440 ),
	make_bp( 'tablet', 'Tablet', 768 ),
	make_bp( 'mobile', 'Mobile', 375 ),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe(
	'CssGenerator',
	function () use ( $breakpoints ) {

		beforeEach(
			function () {
				$this->gen = new CssGenerator();
			}
		);

		it(
			'returns empty string for a tree with no nodes',
			function () use ( $breakpoints ) {
				$tree        = new \stdClass();
				$tree->nodes = new \stdClass();
				expect( $this->gen->generate( $tree, $breakpoints ) )->toBe( '' );
			}
		);

		it(
			'generates a scoped selector for a node',
			function () use ( $breakpoints ) {
				$tree = make_gen_tree( [ 'nx-abc' => [ 'props' => [ 'color' => 'red' ] ] ] );
				$css  = $this->gen->generate( $tree, $breakpoints );

				expect( $css )->toContain( '.nivorax-nx-abc{' );
				expect( $css )->toContain( 'color:red' );
			}
		);

		it(
			'maps camelCase props to kebab-case CSS properties',
			function () use ( $breakpoints ) {
				$tree = make_gen_tree(
					[
						'n1' => [
							'props' => [
								'backgroundColor' => '#fff',
								'minHeight'       => 'auto',
								'flexDirection'   => 'row',
							],
						],
					]
				);
				$css  = $this->gen->generate( $tree, $breakpoints );

				expect( $css )->toContain( 'background-color:#fff' );
				expect( $css )->toContain( 'min-height:auto' );
				expect( $css )->toContain( 'flex-direction:row' );
			}
		);

		it(
			'serialises unit value objects to {value}{unit}',
			function () use ( $breakpoints ) {
				$unit        = new \stdClass();
				$unit->value = 24;
				$unit->unit  = 'px';

				$tree = make_gen_tree( [ 'n1' => [ 'props' => [ 'fontSize' => $unit ] ] ] );
				$css  = $this->gen->generate( $tree, $breakpoints );

				expect( $css )->toContain( 'font-size:24px' );
			}
		);

		it(
			'serialises shadow values',
			function () use ( $breakpoints ) {
				$shadow = new \stdClass();
				// phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$shadow->offsetX = (object) [
					'value' => 0,
					'unit'  => 'px',
				];
				$shadow->offsetY = (object) [
					'value' => 2,
					'unit'  => 'px',
				];
				// phpcs:enable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$shadow->blur   = (object) [
					'value' => 4,
					'unit'  => 'px',
				];
				$shadow->spread = (object) [
					'value' => 0,
					'unit'  => 'px',
				];
				$shadow->color  = 'rgba(0,0,0,0.2)';
				$shadow->inset  = false;

				$tree = make_gen_tree( [ 'n1' => [ 'props' => [ 'boxShadow' => $shadow ] ] ] );
				$css  = $this->gen->generate( $tree, $breakpoints );

				expect( $css )->toContain( 'box-shadow:0px 2px 4px 0px rgba(0,0,0,0.2)' );
			}
		);

		it(
			'expands margin spacing to longhands',
			function () use ( $breakpoints ) {
				$uv = static fn( int $v ) => (object) [
					'value' => $v,
					'unit'  => 'px',
				];

				$spacing         = new \stdClass();
				$spacing->top    = $uv( 8 );
				$spacing->right  = $uv( 0 );
				$spacing->bottom = $uv( 8 );
				$spacing->left   = $uv( 0 );

				$tree = make_gen_tree( [ 'n1' => [ 'props' => [ 'margin' => $spacing ] ] ] );
				$css  = $this->gen->generate( $tree, $breakpoints );

				expect( $css )->toContain( 'margin-top:8px' );
				expect( $css )->toContain( 'margin-right:0px' );
				expect( $css )->toContain( 'margin-bottom:8px' );
				expect( $css )->toContain( 'margin-left:0px' );
			}
		);

		it(
			'generates @media rules for responsive prop objects',
			function () use ( $breakpoints ) {
				$responsive         = new \stdClass();
				$responsive->base   = 'black';
				$responsive->tablet = 'blue';
				$responsive->mobile = 'green';

				$tree = make_gen_tree( [ 'nx-abc' => [ 'props' => [ 'color' => $responsive ] ] ] );
				$css  = $this->gen->generate( $tree, $breakpoints );

				expect( $css )->toContain( '.nivorax-nx-abc{color:black}' );
				expect( $css )->toContain( '@media (max-width:768px){.nivorax-nx-abc{color:blue}}' );
				expect( $css )->toContain( '@media (max-width:375px){.nivorax-nx-abc{color:green}}' );
			}
		);

		it(
			'generates @media rules for node.overrides',
			function () use ( $breakpoints ) {
				$tree = make_gen_tree(
					[
						'nx-ov' => [
							'props'     => [ 'color' => 'black' ],
							'overrides' => [ 'tablet' => [ 'color' => 'red' ] ],
						],
					]
				);
				$css  = $this->gen->generate( $tree, $breakpoints );

				expect( $css )->toContain( '@media (max-width:768px){.nivorax-nx-ov{color:red}}' );
			}
		);

		it(
			'emits media blocks in descending width order',
			function () use ( $breakpoints ) {
				$responsive         = new \stdClass();
				$responsive->base   = 'black';
				$responsive->tablet = 'blue';
				$responsive->mobile = 'green';

				$tree = make_gen_tree( [ 'n1' => [ 'props' => [ 'color' => $responsive ] ] ] );
				$css  = $this->gen->generate( $tree, $breakpoints );

				$tablet_pos = strpos( $css, '@media (max-width:768px)' );
				$mobile_pos = strpos( $css, '@media (max-width:375px)' );

				expect( $tablet_pos )->toBeLessThan( $mobile_pos );
			}
		);

		it(
			'follows STYLE_PROP_ORDER — display before color',
			function () use ( $breakpoints ) {
				$tree = make_gen_tree(
					[
						'n1' => [
							'props' => [
								'color'   => 'red',
								'display' => 'flex',
							],
						],
					]
				);
				$css  = $this->gen->generate( $tree, $breakpoints );

				$block = preg_match( '/\.nivorax-n1\{([^}]+)\}/', $css, $m ) ? $m[1] : '';
				expect( strpos( $block, 'display' ) )->toBeLessThan( strpos( $block, 'color' ) );
			}
		);

		it(
			'is deterministic — same input produces identical output',
			function () use ( $breakpoints ) {
				$tree = make_gen_tree(
					[
						'n1' => [
							'props' => [
								'color'   => 'red',
								'display' => 'flex',
							],
						],
					]
				);
				expect( $this->gen->generate( $tree, $breakpoints ) )->toBe( $this->gen->generate( $tree, $breakpoints ) );
			}
		);

		it(
			'emits nothing for props with no style values',
			function () use ( $breakpoints ) {
				$tree = make_gen_tree( [ 'n1' => [ 'props' => [ 'text' => 'Hello' ] ] ] );
				expect( $this->gen->generate( $tree, $breakpoints ) )->toBe( '' );
			}
		);
	}
);
