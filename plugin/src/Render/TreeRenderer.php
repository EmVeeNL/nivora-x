<?php

declare( strict_types=1 );

namespace NivoraX\Render;

defined( 'ABSPATH' ) || exit;

/**
 * Walks a NivoraX document tree and produces an escaped HTML string.
 *
 * The walker is depth-first and recursive. Each node is rendered by its
 * registered ElementRenderer; unknown types fall back to FallbackRenderer.
 * Each node's root element carries the `.nivorax-{id}` scoped class hook
 * targeted by the CSS engine.
 */
final class TreeRenderer {

	/**
	 * Initialises the walker with the given registry.
	 *
	 * @param RendererRegistry $registry Renderer registry to resolve element renderers.
	 */
	public function __construct( private readonly RendererRegistry $registry ) {}

	/**
	 * Render a complete document tree to an HTML string.
	 *
	 * @param object $tree Decoded tree ({ rootId: string, nodes: object }).
	 * @return string Escaped HTML for the full tree.
	 */
	public function render( object $tree ): string {
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- camelCase from JS JSON schema.
		$root_id = $tree->rootId ?? '';
		$nodes   = $tree->nodes ?? new \stdClass();

		if ( '' === $root_id || ! isset( $nodes->$root_id ) ) {
			return '';
		}

		return $this->render_node( $root_id, $nodes );
	}

	/**
	 * Recursively render a single node and its descendants.
	 *
	 * @param string    $node_id Node ID to render.
	 * @param \stdClass $nodes   All nodes keyed by ID.
	 * @return string Escaped HTML fragment.
	 */
	private function render_node( string $node_id, \stdClass $nodes ): string {
		if ( ! isset( $nodes->$node_id ) ) {
			return '';
		}

		$node     = $nodes->$node_id;
		$children = $node->children ?? [];

		$children_html = '';
		foreach ( $children as $child_id ) {
			$children_html .= $this->render_node( (string) $child_id, $nodes );
		}

		$type     = (string) ( $node->type ?? '' );
		$renderer = $this->registry->resolve( $type );

		return $renderer->render( $node, $children_html, $this->registry );
	}
}
