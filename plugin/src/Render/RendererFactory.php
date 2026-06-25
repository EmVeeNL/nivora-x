<?php

declare( strict_types=1 );

namespace NivoraX\Render;

use NivoraX\Render\Elements\ContainerRenderer;
use NivoraX\Render\Elements\HeadingRenderer;
use NivoraX\Render\Elements\SectionRenderer;
use NivoraX\Render\Elements\TextRenderer;

defined( 'ABSPATH' ) || exit;

/**
 * Builds a RendererRegistry pre-loaded with all starter-set element renderers.
 */
final class RendererFactory {

	/**
	 * Create a registry populated with the built-in starter-set renderers.
	 *
	 * @return RendererRegistry Ready-to-use registry.
	 */
	public static function make(): RendererRegistry {
		$registry = new RendererRegistry();

		$registry->register( 'section', new SectionRenderer() );
		$registry->register( 'container', new ContainerRenderer() );
		$registry->register( 'heading', new HeadingRenderer() );
		$registry->register( 'text', new TextRenderer() );

		return $registry;
	}
}
