<?php

declare( strict_types=1 );

namespace NivoraX\Tests\Unit\Css;

use NivoraX\Css\CssGenerator;

$desktop_bp = [
	[
		'id'    => 'desktop',
		'label' => 'Desktop',
		'width' => 9999,
	],
];

$multi_bp = [
	[
		'id'    => 'desktop',
		'label' => 'Desktop',
		'width' => 9999,
	],
	[
		'id'    => 'tablet',
		'label' => 'Tablet',
		'width' => 768,
	],
];

$tokens = [
	[
		'id'    => 'color-primary',
		'group' => 'color',
		'name'  => 'Primary',
		'value' => '#3b82f6',
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
];

describe(
	'CssGenerator — token features',
	function () use ( $desktop_bp, $multi_bp, $tokens ) {

		beforeEach(
			function () {
				$this->gen = new CssGenerator();
			}
		);

		it(
			'prepends a :root variables block when tokens are supplied',
			function () use ( $desktop_bp, $tokens ) {
				$props        = new \stdClass();
				$props->color = '#111';
				$node         = (object) [
					'id'        => 'n1',
					'type'      => 'section',
					'props'     => $props,
					'overrides' => new \stdClass(),
					'children'  => [],
				];
				$tree         = new \stdClass();
				$tree->rootId = 'n1'; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$tree->nodes  = (object) [ 'n1' => $node ];

				$css = $this->gen->generate( $tree, $desktop_bp, $tokens );
				expect( $css )->toStartWith( ':root{' )
					->and( $css )->toContain( '--nx-color-primary:#3b82f6' )
					->and( $css )->toContain( '--nx-spacing-md:16px' );
			}
		);

		it(
			'does not emit a :root block when no tokens are supplied',
			function () use ( $desktop_bp ) {
				$props        = new \stdClass();
				$props->color = '#111';
				$node         = (object) [
					'id'        => 'n1',
					'type'      => 'section',
					'props'     => $props,
					'overrides' => new \stdClass(),
					'children'  => [],
				];
				$tree         = new \stdClass();
				$tree->rootId = 'n1'; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$tree->nodes  = (object) [ 'n1' => $node ];

				$css = $this->gen->generate( $tree, $desktop_bp );
				expect( $css )->not->toContain( ':root{' );
			}
		);

		it(
			'resolves a token reference to var(--nx-{id})',
			function () use ( $desktop_bp, $tokens ) {
				$token_ref          = new \stdClass();
				$token_ref->__token = 'color-primary'; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$props              = new \stdClass();
				$props->color       = $token_ref;
				$node               = (object) [
					'id'        => 'n1',
					'type'      => 'section',
					'props'     => $props,
					'overrides' => new \stdClass(),
					'children'  => [],
				];
				$tree               = new \stdClass();
				$tree->rootId       = 'n1'; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$tree->nodes        = (object) [ 'n1' => $node ];

				$css = $this->gen->generate( $tree, $desktop_bp, $tokens );
				expect( $css )->toContain( 'color:var(--nx-color-primary)' );
			}
		);

		it(
			'keeps raw values as-is',
			function () use ( $desktop_bp, $tokens ) {
				$props        = new \stdClass();
				$props->color = '#ff0000';
				$node         = (object) [
					'id'        => 'n1',
					'type'      => 'section',
					'props'     => $props,
					'overrides' => new \stdClass(),
					'children'  => [],
				];
				$tree         = new \stdClass();
				$tree->rootId = 'n1'; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$tree->nodes  = (object) [ 'n1' => $node ];

				$css = $this->gen->generate( $tree, $desktop_bp, $tokens );
				expect( $css )->toContain( 'color:#ff0000' )
					->and( $css )->not->toContain( 'var(' );
			}
		);

		it(
			'resolves a token reference in a breakpoint override',
			function () use ( $multi_bp, $tokens ) {
				$token_ref                = new \stdClass();
				$token_ref->__token       = 'color-primary'; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$responsive_color         = new \stdClass();
				$responsive_color->base   = '#000';
				$responsive_color->tablet = $token_ref; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$props                    = new \stdClass();
				$props->color             = $responsive_color;
				$node                     = (object) [
					'id'        => 'n1',
					'type'      => 'section',
					'props'     => $props,
					'overrides' => new \stdClass(),
					'children'  => [],
				];
				$tree                     = new \stdClass();
				$tree->rootId             = 'n1'; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$tree->nodes              = (object) [ 'n1' => $node ];

				$css = $this->gen->generate( $tree, $multi_bp, $tokens );
				expect( $css )->toContain( '@media (max-width:768px){' )
					->and( $css )->toContain( 'color:var(--nx-color-primary)' );
			}
		);
	}
);
