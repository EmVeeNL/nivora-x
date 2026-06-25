<?php

declare( strict_types=1 );

use Brain\Monkey\Functions;
use NivoraX\Render\ElementRendererInterface;
use NivoraX\Render\FallbackRenderer;
use NivoraX\Render\RendererRegistry;
use NivoraX\Render\TreeRenderer;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal tree stdClass object.
 *
 * @param string               $root_id Root node ID.
 * @param array<string, mixed> $nodes   Node definitions keyed by ID.
 * @return \stdClass
 */
function make_tree( string $root_id, array $nodes ): \stdClass {
	$tree         = new \stdClass();
	$tree->rootId = $root_id; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	$tree->nodes  = new \stdClass();

	foreach ( $nodes as $id => $data ) {
		$node            = new \stdClass();
		$node->id        = $id;
		$node->type      = $data['type'] ?? 'unknown';
		$node->props     = (object) ( $data['props'] ?? [] );
		$node->children  = $data['children'] ?? [];
		$node->overrides = new \stdClass();
		$node->meta      = new \stdClass();

		$tree->nodes->$id = $node;
	}

	return $tree;
}

/**
 * Minimal renderer that emits `<span class="nivorax-{id}" data-node-id="{id}">{children}</span>`.
 * Uses plain string cast (safe for test IDs — no user input).
 *
 * @return ElementRendererInterface
 */
function span_renderer(): ElementRendererInterface {
	return new class() implements ElementRendererInterface {
		/**
		 * Render the span element.
		 *
		 * @param object           $node          Decoded node.
		 * @param string           $children_html Pre-rendered children HTML.
		 * @param RendererRegistry $registry      Renderer registry (required by interface; unused in stub).
		 * @return string
		 */
		public function render( object $node, string $children_html, RendererRegistry $registry ): string { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
			$id = (string) $node->id;
			return "<span class=\"nivorax-{$id}\" data-node-id=\"{$id}\">{$children_html}</span>";
		}
	};
}

// ---------------------------------------------------------------------------
// RendererRegistry
// ---------------------------------------------------------------------------

describe(
	'RendererRegistry',
	function (): void {

		it(
			'resolves a registered renderer by type',
			function (): void {
				$registry = new RendererRegistry();
				$renderer = span_renderer();
				$registry->register( 'span', $renderer );

				expect( $registry->resolve( 'span' ) )->toBe( $renderer )
					->and( $registry->has( 'span' ) )->toBeTrue();
			}
		);

		it(
			'returns the fallback for unknown types',
			function (): void {
				$registry = new RendererRegistry();

				expect( $registry->resolve( 'unknown-type' ) )->toBeInstanceOf( FallbackRenderer::class )
					->and( $registry->has( 'unknown-type' ) )->toBeFalse();
			}
		);
	}
);

// ---------------------------------------------------------------------------
// TreeRenderer
// ---------------------------------------------------------------------------

describe(
	'TreeRenderer',
	function (): void {

		beforeEach(
			function (): void {
				Functions\when( 'esc_attr' )->returnArg();
			}
		);

		it(
			'renders a single-node tree',
			function (): void {
				$registry = new RendererRegistry();
				$registry->register( 'span', span_renderer() );
				$renderer = new TreeRenderer( $registry );

				$tree   = make_tree( 'root', [ 'root' => [ 'type' => 'span' ] ] );
				$output = $renderer->render( $tree );

				expect( $output )->toBe( '<span class="nivorax-root" data-node-id="root"></span>' );
			}
		);

		it(
			'renders children in order',
			function (): void {
				$registry = new RendererRegistry();
				$registry->register( 'span', span_renderer() );
				$renderer = new TreeRenderer( $registry );

				$tree = make_tree(
					'root',
					[
						'root' => [
							'type'     => 'span',
							'children' => [ 'a', 'b' ],
						],
						'a'    => [ 'type' => 'span' ],
						'b'    => [ 'type' => 'span' ],
					]
				);

				$output = $renderer->render( $tree );

				expect( $output )->toBe(
					'<span class="nivorax-root" data-node-id="root">'
					. '<span class="nivorax-a" data-node-id="a"></span>'
					. '<span class="nivorax-b" data-node-id="b"></span>'
					. '</span>'
				);
			}
		);

		it(
			'falls back safely for unknown types without fataling',
			function (): void {
				$registry = new RendererRegistry();
				$renderer = new TreeRenderer( $registry );

				$tree   = make_tree( 'root', [ 'root' => [ 'type' => 'does-not-exist' ] ] );
				$output = $renderer->render( $tree );

				expect( $output )->toContain( 'data-node-id="root"' )
					->and( $output )->toContain( 'nivorax-root' );
			}
		);

		it(
			'emits an empty string for an empty or malformed tree',
			function (): void {
				$registry = new RendererRegistry();
				$renderer = new TreeRenderer( $registry );

				expect( $renderer->render( new \stdClass() ) )->toBe( '' );
			}
		);

		it(
			'scopes each node with the nivorax-{id} class hook',
			function (): void {
				$registry = new RendererRegistry();
				$registry->register( 'span', span_renderer() );
				$renderer = new TreeRenderer( $registry );

				$tree   = make_tree( 'nx-abc123', [ 'nx-abc123' => [ 'type' => 'span' ] ] );
				$output = $renderer->render( $tree );

				expect( $output )->toContain( 'class="nivorax-nx-abc123"' );
			}
		);
	}
);
