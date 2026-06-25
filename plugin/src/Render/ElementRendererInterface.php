<?php

declare( strict_types=1 );

namespace NivoraX\Render;

defined( 'ABSPATH' ) || exit;

/**
 * Contract for per-element PHP renderers.
 *
 * Each renderer is responsible for one element type. It receives the decoded
 * node object, a pre-rendered children string (recursively resolved by
 * TreeRenderer), and the registry (for nested look-ups if needed).
 * It returns a fully-escaped HTML string.
 */
interface ElementRendererInterface {

	/**
	 * Render the node to an escaped HTML string.
	 *
	 * @param object           $node         Decoded node (id, type, props, children, overrides, meta).
	 * @param string           $children_html Pre-rendered inner HTML for child nodes.
	 * @param RendererRegistry $registry Registry (available for custom recursive needs).
	 * @return string Escaped, valid HTML fragment.
	 */
	public function render( object $node, string $children_html, RendererRegistry $registry ): string;
}
