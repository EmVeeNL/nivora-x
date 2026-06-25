<?php

declare( strict_types=1 );

use Brain\Monkey\Functions;
use NivoraX\Render\Elements\ContainerRenderer;
use NivoraX\Render\Elements\HeadingRenderer;
use NivoraX\Render\Elements\SectionRenderer;
use NivoraX\Render\Elements\TextRenderer;
use NivoraX\Render\RendererFactory;
use NivoraX\Render\RendererRegistry;
use NivoraX\Render\TreeRenderer;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Build a minimal node stdClass.
 *
 * @param string               $id    Node ID.
 * @param string               $type  Element type.
 * @param array<string, mixed> $props Node props.
 * @param string[]             $children Child IDs.
 * @return \stdClass
 */
function make_node( string $id, string $type, array $props = [], array $children = [] ): \stdClass {
	$node            = new \stdClass();
	$node->id        = $id;
	$node->type      = $type;
	$node->props     = (object) $props;
	$node->children  = $children;
	$node->overrides = new \stdClass();
	$node->meta      = new \stdClass();

	return $node;
}

/**
 * Create a shared RendererRegistry stub for tests.
 *
 * @return RendererRegistry
 */
function make_registry(): RendererRegistry {
	return new RendererRegistry();
}

// ---------------------------------------------------------------------------
// Shared mock setup
// ---------------------------------------------------------------------------

beforeEach(
	function (): void {
		Functions\when( 'esc_attr' )->returnArg();
		Functions\when( 'esc_html' )->returnArg();
	}
);

// ---------------------------------------------------------------------------
// SectionRenderer
// ---------------------------------------------------------------------------

describe(
	'SectionRenderer',
	function (): void {

		it(
			'renders a section with scoped class and data-node-id',
			function (): void {
				$renderer = new SectionRenderer();
				$node     = make_node( 'nx-sec', 'section' );
				$output   = $renderer->render( $node, '', make_registry() );

				expect( $output )->toContain( 'class="nivorax-nx-sec"' )
					->and( $output )->toContain( 'data-node-id="nx-sec"' )
					->and( $output )->toContain( '<section' )
					->and( $output )->toContain( '</section>' );
			}
		);

		it(
			'renders children HTML inside the section',
			function (): void {
				$renderer = new SectionRenderer();
				$node     = make_node( 'root', 'section' );
				$output   = $renderer->render( $node, '<p>child</p>', make_registry() );

				expect( $output )->toContain( '<p>child</p>' );
			}
		);

		it(
			'renders an optional html-id attribute when htmlId prop is set',
			function (): void {
				$renderer = new SectionRenderer();
				$node     = make_node( 'nx-sec', 'section', [ 'htmlId' => 'hero' ] );
				$output   = $renderer->render( $node, '', make_registry() );

				expect( $output )->toContain( 'id="hero"' );
			}
		);

		it(
			'applies the default inline styles',
			function (): void {
				$renderer = new SectionRenderer();
				$node     = make_node( 'nx-sec', 'section' );
				$output   = $renderer->render( $node, '', make_registry() );

				expect( $output )->toContain( 'display:block' )
					->and( $output )->toContain( 'width:100%' );
			}
		);
	}
);

// ---------------------------------------------------------------------------
// ContainerRenderer
// ---------------------------------------------------------------------------

describe(
	'ContainerRenderer',
	function (): void {

		it(
			'renders a div with scoped class and data-node-id',
			function (): void {
				$renderer = new ContainerRenderer();
				$node     = make_node( 'nx-con', 'container' );
				$output   = $renderer->render( $node, '', make_registry() );

				expect( $output )->toContain( 'class="nivorax-nx-con"' )
					->and( $output )->toContain( 'data-node-id="nx-con"' )
					->and( $output )->toContain( '<div' )
					->and( $output )->toContain( '</div>' );
			}
		);

		it(
			'renders children in order',
			function (): void {
				$renderer = new ContainerRenderer();
				$node     = make_node( 'root', 'container' );
				$output   = $renderer->render( $node, '<span>a</span><span>b</span>', make_registry() );

				expect( $output )->toContain( '<span>a</span><span>b</span>' );
			}
		);
	}
);

// ---------------------------------------------------------------------------
// HeadingRenderer
// ---------------------------------------------------------------------------

describe(
	'HeadingRenderer',
	function (): void {

		it(
			'renders an h2 by default',
			function (): void {
				$renderer = new HeadingRenderer();
				$node     = make_node( 'nx-h', 'heading', [ 'text' => 'Hello' ] );
				$output   = $renderer->render( $node, '', make_registry() );

				expect( $output )->toContain( '<h2' )
					->and( $output )->toContain( '</h2>' )
					->and( $output )->toContain( 'Hello' );
			}
		);

		it(
			'renders the correct h-level from the level prop',
			function (): void {
				$renderer = new HeadingRenderer();

				foreach ( range( 1, 6 ) as $level ) {
					$node   = make_node(
						"nx-h{$level}",
						'heading',
						[
							'text'  => "H{$level}",
							'level' => $level,
						]
					);
					$output = $renderer->render( $node, '', make_registry() );

					expect( $output )->toContain( "<h{$level}" )
						->and( $output )->toContain( "</h{$level}>" );
				}
			}
		);

		it(
			'clamps level to h1–h6',
			function (): void {
				$renderer = new HeadingRenderer();

				$node_low  = make_node( 'h-low', 'heading', [ 'level' => 0 ] );
				$node_high = make_node( 'h-high', 'heading', [ 'level' => 99 ] );

				expect( $renderer->render( $node_low, '', make_registry() ) )->toContain( '<h1' );
				expect( $renderer->render( $node_high, '', make_registry() ) )->toContain( '<h6' );
			}
		);

		it(
			'escapes the text prop',
			function (): void {
				Functions\when( 'esc_html' )->alias( fn( string $v ) => htmlspecialchars( $v, ENT_QUOTES, 'UTF-8' ) );

				$renderer = new HeadingRenderer();
				$node     = make_node( 'nx-h', 'heading', [ 'text' => '<script>alert(1)</script>' ] );
				$output   = $renderer->render( $node, '', make_registry() );

				expect( $output )->not->toContain( '<script>' )
					->and( $output )->toContain( '&lt;script&gt;' );
			}
		);
	}
);

// ---------------------------------------------------------------------------
// TextRenderer
// ---------------------------------------------------------------------------

describe(
	'TextRenderer',
	function (): void {

		it(
			'renders a <p> with scoped class and text content',
			function (): void {
				$renderer = new TextRenderer();
				$node     = make_node( 'nx-txt', 'text', [ 'text' => 'Hello world' ] );
				$output   = $renderer->render( $node, '', make_registry() );

				expect( $output )->toContain( '<p' )
					->and( $output )->toContain( '</p>' )
					->and( $output )->toContain( 'class="nivorax-nx-txt"' )
					->and( $output )->toContain( 'Hello world' );
			}
		);

		it(
			'falls back to "Text block" when text prop is absent',
			function (): void {
				$renderer = new TextRenderer();
				$node     = make_node( 'nx-txt', 'text' );
				$output   = $renderer->render( $node, '', make_registry() );

				expect( $output )->toContain( 'Text block' );
			}
		);
	}
);

// ---------------------------------------------------------------------------
// RendererFactory + TreeRenderer integration
// ---------------------------------------------------------------------------

describe(
	'RendererFactory starter-set integration',
	function (): void {

		it(
			'renders a section containing a container heading and text',
			function (): void {
				$tree         = new \stdClass();
				$tree->rootId = 'sec'; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$tree->nodes  = new \stdClass();

				$sec              = make_node( 'sec', 'section', [], [ 'con' ] );
				$con              = make_node( 'con', 'container', [], [ 'h1', 'txt' ] );
				$h1               = make_node(
					'h1',
					'heading',
					[
						'text'  => 'Title',
						'level' => 1,
					]
				);
				$txt              = make_node( 'txt', 'text', [ 'text' => 'Body copy.' ] );
				$tree->nodes->sec = $sec;
				$tree->nodes->con = $con;
				$tree->nodes->h1  = $h1;
				$tree->nodes->txt = $txt;

				$renderer = new TreeRenderer( RendererFactory::make() );
				$output   = $renderer->render( $tree );

				expect( $output )->toContain( '<section' )
					->and( $output )->toContain( '<div' )
					->and( $output )->toContain( '<h1' )
					->and( $output )->toContain( '<p' )
					->and( $output )->toContain( 'Title' )
					->and( $output )->toContain( 'Body copy.' );
			}
		);
	}
);
