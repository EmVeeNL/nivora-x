<?php

declare( strict_types=1 );

namespace NivoraX\FrontEnd;

use NivoraX\Editor\EditorMode;
use NivoraX\Render\RendererFactory;
use NivoraX\Render\TreeRenderer;
use NivoraX\Storage\DocumentStore;

defined( 'ABSPATH' ) || exit;

/**
 * Switches front-end rendering to the NivoraX document for nivorax-mode posts.
 */
final class RenderSwitch {

	/** Hooks the content filter at late priority. */
	public static function register(): void {
		// Late priority (20) to override other plugins but stay predictable.
		add_filter( 'the_content', [ self::class, 'maybe_switch' ], 20 );
	}

	/**
	 * Returns NivoraX output for nivorax-mode posts, original content otherwise.
	 *
	 * @param string $content Original post_content.
	 * @return string Filtered content.
	 */
	public static function maybe_switch( string $content ): string {
		if ( is_admin() ) {
			return $content;
		}

		$post = get_post();
		if ( ! $post instanceof \WP_Post ) {
			return $content;
		}

		if ( ! EditorMode::is_nivorax( $post->ID ) ) {
			return $content;
		}

		return self::render_nivorax( $post->ID );
	}

	/**
	 * Render the NivoraX document for a post using the PHP element renderer.
	 *
	 * @param int $post_id Post ID.
	 * @return string Rendered HTML string.
	 */
	private static function render_nivorax( int $post_id ): string {
		$envelope = DocumentStore::read( $post_id );
		$tree     = $envelope->tree;

		if ( ! is_object( $tree ) ) {
			return '';
		}

		$registry = RendererFactory::make();
		$renderer = new TreeRenderer( $registry );

		return $renderer->render( $tree );
	}
}
