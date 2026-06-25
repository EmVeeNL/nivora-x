<?php

declare( strict_types=1 );

namespace NivoraX\Render\Elements;

use NivoraX\Render\ElementRendererInterface;
use NivoraX\Render\RendererRegistry;

defined( 'ABSPATH' ) || exit;

/**
 * Renders the `text` element type.
 *
 * Matches the React TextElement: a `<p>` tag with escaped text content and
 * default typographic inline styles.
 */
final class TextRenderer implements ElementRendererInterface {

	/**
	 * Default inline styles mirroring the React TextElement definition.
	 */
	private const DEFAULT_STYLE = 'display:block;margin:0 0 1em;font-family:inherit;line-height:1.6';

	/**
	 * Render a text node to an escaped HTML string.
	 *
	 * @param object           $node          Decoded node.
	 * @param string           $children_html Pre-rendered children HTML (not used for text).
	 * @param RendererRegistry $registry      Renderer registry (unused; required by interface).
	 * @return string Escaped HTML fragment.
	 */
	public function render( object $node, string $children_html, RendererRegistry $registry ): string { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundInImplementedInterfaceAfterLastUsed,Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		$id   = esc_attr( (string) ( $node->id ?? '' ) );
		$text = esc_html( (string) ( $node->props->text ?? 'Text block' ) );

		return sprintf(
			'<p class="nivorax-%s" data-node-id="%s" style="%s">%s</p>',
			$id,
			$id,
			self::DEFAULT_STYLE,
			$text
		);
	}
}
