<?php

declare( strict_types=1 );

namespace NivoraX\Render;

defined( 'ABSPATH' ) || exit;

/**
 * Registry mapping element types to their PHP renderers.
 *
 * Mirrors the JS element registry (Phase 05). Unknown types fall back to
 * FallbackRenderer so the tree never fatals on unknown element types.
 */
final class RendererRegistry {

	/**
	 * Registered renderers keyed by element type.
	 *
	 * @var array<string, ElementRendererInterface>
	 */
	private array $renderers = [];

	/**
	 * Shared fallback for unknown element types.
	 *
	 * @var FallbackRenderer
	 */
	private readonly FallbackRenderer $fallback;

	/** Initialises the registry with the shared fallback renderer. */
	public function __construct() {
		$this->fallback = new FallbackRenderer();
	}

	/**
	 * Register a renderer for an element type.
	 *
	 * @param string                   $type     Element type slug (e.g. 'section').
	 * @param ElementRendererInterface $renderer Renderer instance.
	 */
	public function register( string $type, ElementRendererInterface $renderer ): void {
		$this->renderers[ $type ] = $renderer;
	}

	/**
	 * Resolve the renderer for a type; returns the fallback for unknown types.
	 *
	 * @param string $type Element type slug.
	 * @return ElementRendererInterface Registered renderer or the fallback.
	 */
	public function resolve( string $type ): ElementRendererInterface {
		return $this->renderers[ $type ] ?? $this->fallback;
	}

	/**
	 * Whether a renderer is registered for the given type.
	 *
	 * @param string $type Element type slug.
	 * @return bool
	 */
	public function has( string $type ): bool {
		return isset( $this->renderers[ $type ] );
	}
}
