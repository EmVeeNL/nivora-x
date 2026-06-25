<?php

declare( strict_types=1 );

namespace NivoraX\Render\Elements;

use NivoraX\Render\ElementRendererInterface;
use NivoraX\Render\RendererRegistry;

defined( 'ABSPATH' ) || exit;

/**
 * Renders the `container` element type.
 *
 * Matches the React ContainerElement: a centred `<div>` with max-width and
 * horizontal padding. Children render recursively in order.
 */
final class ContainerRenderer implements ElementRendererInterface {

	/**
	 * Default inline styles mirroring the React ContainerElement definition.
	 */
	private const DEFAULT_STYLE = 'display:block;width:100%;max-width:1200px;margin:0 auto;padding:0 24px;box-sizing:border-box;min-height:48px';

	/**
	 * Render a container node to an escaped HTML string.
	 *
	 * @param object           $node          Decoded node.
	 * @param string           $children_html Pre-rendered children HTML.
	 * @param RendererRegistry $registry      Renderer registry (unused; required by interface).
	 * @return string Escaped HTML fragment.
	 */
	public function render( object $node, string $children_html, RendererRegistry $registry ): string { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		$id      = esc_attr( (string) ( $node->id ?? '' ) );
		$html_id = isset( $node->props->htmlId ) ? esc_attr( (string) $node->props->htmlId ) : ''; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

		$id_attr = '' !== $html_id ? sprintf( ' id="%s"', $html_id ) : '';

		return sprintf(
			'<div class="nivorax-%s" data-node-id="%s"%s style="%s">%s</div>',
			$id,
			$id,
			$id_attr,
			self::DEFAULT_STYLE,
			$children_html
		);
	}
}
