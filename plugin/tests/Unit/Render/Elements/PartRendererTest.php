<?php

declare( strict_types=1 );

use Brain\Monkey\Functions;
use NivoraX\Render\ElementRendererInterface;
use NivoraX\Render\Elements\PartRenderer;
use NivoraX\Render\RendererRegistry;
use NivoraX\Templates\TemplatePostType;

/**
 * Minimal renderer that echoes a node's `props->content` — lets the part
 * renderer's inlined output be asserted without the full starter set.
 */
function nivorax_part_text_renderer(): ElementRendererInterface {
	return new class() implements ElementRendererInterface {
		/**
		 * Echo the node's content prop.
		 *
		 * @param object           $node          Decoded node.
		 * @param string           $children_html Pre-rendered children (unused).
		 * @param RendererRegistry $registry      Registry (unused).
		 * @return string
		 */
		public function render( object $node, string $children_html, RendererRegistry $registry ): string { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter
			return (string) ( $node->props->content ?? '' );
		}
	};
}

/**
 * Build a part node referencing a template id.
 *
 * @param int $template_id Referenced template id.
 */
function nivorax_part_node( int $template_id ): object {
	return (object) [
		'id'    => 'part1',
		'type'  => 'part',
		'props' => (object) [ 'templateId' => $template_id ],
	];
}

describe(
	'PartRenderer',
	function (): void {

		beforeEach(
			function (): void {
				Functions\when( 'esc_attr' )->returnArg();
				Functions\when( 'esc_html' )->returnArg();
			}
		);

		it(
			'inlines the referenced template content',
			function (): void {
				Functions\when( 'get_post_type' )->justReturn( TemplatePostType::POST_TYPE );
				Functions\when( 'get_post_meta' )->justReturn(
					'{"version":1,"tree":{"rootId":"r","nodes":{"r":{"id":"r","type":"text","props":{"content":"HELLO"}}}},"meta":{}}'
				);

				$registry = new RendererRegistry();
				$registry->register( 'text', nivorax_part_text_renderer() );

				$html = ( new PartRenderer() )->render( nivorax_part_node( 5 ), '', $registry );

				expect( $html )->toContain( 'HELLO' )
				->and( $html )->toContain( 'data-nivorax-part="5"' );
			}
		);

		it(
			'reflects edits to the referenced template (propagation, no caching)',
			function (): void {
				Functions\when( 'get_post_type' )->justReturn( TemplatePostType::POST_TYPE );
				$registry = new RendererRegistry();
				$registry->register( 'text', nivorax_part_text_renderer() );

				Functions\when( 'get_post_meta' )->justReturn(
					'{"version":1,"tree":{"rootId":"r","nodes":{"r":{"id":"r","type":"text","props":{"content":"BEFORE"}}}},"meta":{}}'
				);
				$first = ( new PartRenderer() )->render( nivorax_part_node( 5 ), '', $registry );

				Functions\when( 'get_post_meta' )->justReturn(
					'{"version":1,"tree":{"rootId":"r","nodes":{"r":{"id":"r","type":"text","props":{"content":"AFTER"}}}},"meta":{}}'
				);
				$second = ( new PartRenderer() )->render( nivorax_part_node( 5 ), '', $registry );

				expect( $first )->toContain( 'BEFORE' )
				->and( $second )->toContain( 'AFTER' );
			}
		);

		it(
			'fails safe with a comment when the reference is missing',
			function (): void {
				Functions\when( 'get_post_type' )->justReturn( 'page' );

				$html = ( new PartRenderer() )->render( nivorax_part_node( 99 ), '', new RendererRegistry() );

				expect( $html )->toContain( 'not found' )
				->and( $html )->not->toContain( 'data-nivorax-part' );
			}
		);

		it(
			'returns a notice when no template is selected',
			function (): void {
				$html = ( new PartRenderer() )->render( nivorax_part_node( 0 ), '', new RendererRegistry() );
				expect( $html )->toContain( 'no template selected' );
			}
		);

		it(
			'detects and blocks a recursive embed (cycle)',
			function (): void {
				Functions\when( 'get_post_type' )->justReturn( TemplatePostType::POST_TYPE );
				// Template 5 embeds template 5 — its tree is a part node pointing back at itself.
				Functions\when( 'get_post_meta' )->justReturn(
					'{"version":1,"tree":{"rootId":"r","nodes":{"r":{"id":"r","type":"part","props":{"templateId":5}}}},"meta":{}}'
				);

				$registry = new RendererRegistry();
				$registry->register( 'part', new PartRenderer() );

				$html = ( new PartRenderer() )->render( nivorax_part_node( 5 ), '', $registry );

				expect( $html )->toContain( 'cycle detected for template #5' );
			}
		);
	}
);
