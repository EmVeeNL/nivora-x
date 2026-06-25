<?php

declare( strict_types=1 );

namespace NivoraX\Render\Elements;

use NivoraX\Render\ElementRendererInterface;
use NivoraX\Render\RendererRegistry;

defined( 'ABSPATH' ) || exit;

/**
 * Renders the `heading` element type.
 *
 * Matches the React HeadingElement: an `<h1>`–`<h6>` tag chosen by the
 * `level` prop (defaults to h2), with escaped text content.
 */
final class HeadingRenderer implements ElementRendererInterface {

	/**
	 * Default inline styles mirroring the React HeadingElement definition.
	 */
	private const DEFAULT_STYLE = 'display:block;margin:0 0 0.5em;font-family:inherit;font-weight:700;line-height:1.25';

	/**
	 * Allowed heading tag names (h1–h6).
	 */
	private const ALLOWED_TAGS = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];

	/**
	 * Render a heading node to an escaped HTML string.
	 *
	 * @param object           $node          Decoded node.
	 * @param string           $children_html Pre-rendered children HTML (not used for headings).
	 * @param RendererRegistry $registry      Renderer registry (unused; required by interface).
	 * @return string Escaped HTML fragment.
	 */
	public function render( object $node, string $children_html, RendererRegistry $registry ): string { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundInImplementedInterfaceAfterLastUsed,Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		$id    = esc_attr( (string) ( $node->id ?? '' ) );
		$level = (int) ( $node->props->level ?? 2 );
		$level = max( 1, min( 6, $level ) );
		$tag   = self::ALLOWED_TAGS[ $level - 1 ];
		$text  = esc_html( (string) ( $node->props->text ?? 'Heading' ) );

		return sprintf(
			'<%1$s class="nivorax-%2$s" data-node-id="%2$s" style="%3$s">%4$s</%1$s>',
			$tag,
			$id,
			self::DEFAULT_STYLE,
			$text
		);
	}
}
