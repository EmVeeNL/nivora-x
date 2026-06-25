<?php

declare( strict_types=1 );

namespace NivoraX\Css;

use NivoraX\Settings\Breakpoints;
use NivoraX\Storage\DocumentStore;

defined( 'ABSPATH' ) || exit;

/**
 * Wires the CSS generator into the WordPress lifecycle:
 *  1. Generate + store CSS when a NivoraX document is saved/published.
 *  2. Enqueue the stored CSS as a versioned stylesheet on the front end.
 *
 * Registration: `CssPipeline::register()` is called once from Plugin.php.
 */
final class CssPipeline {

	/**
	 * CSS generator instance.
	 *
	 * @var CssGenerator
	 */
	private CssGenerator $generator;

	/**
	 * CSS store instance.
	 *
	 * @var CssStoreInterface
	 */
	private CssStoreInterface $store;

	/**
	 * Inject dependencies.
	 *
	 * @param CssGenerator      $generator CSS generator instance.
	 * @param CssStoreInterface $store     CSS store instance.
	 */
	public function __construct( CssGenerator $generator, CssStoreInterface $store ) {
		$this->generator = $generator;
		$this->store     = $store;
	}

	/**
	 * Register WordPress hooks.
	 *
	 * @return void
	 */
	public function register(): void {
		add_action( 'save_post_nivorax-page', [ $this, 'on_save' ], 10, 2 );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue' ] );
	}

	/**
	 * Triggered on `save_post_nivorax-page`.
	 * Reads the document tree from postmeta, generates CSS, and stores it.
	 *
	 * @param int      $post_id Post ID.
	 * @param \WP_Post $post    Post object.
	 * @return void
	 */
	public function on_save( int $post_id, \WP_Post $post ): void { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}

		$envelope = DocumentStore::read( $post_id );
		$tree     = $envelope->tree;

		if ( ! is_object( $tree ) ) {
			return;
		}

		$breakpoints = Breakpoints::all();
		$css         = $this->generator->generate( $tree, $breakpoints );
		$this->store->store( $post_id, $css );
	}

	/**
	 * Triggered on `wp_enqueue_scripts`.
	 * Enqueues the stored CSS for singular NivoraX posts.
	 *
	 * @return void
	 */
	public function enqueue(): void {
		if ( ! is_singular( 'nivorax-page' ) ) {
			return;
		}

		$post_id = get_the_ID();
		if ( ! $post_id ) {
			return;
		}

		$version = $this->store->get_version( $post_id );
		$url     = $this->store->get_url( $post_id );

		if ( null !== $url ) {
			wp_enqueue_style(
				"nivorax-page-{$post_id}",
				$url,
				[],
				'' !== $version ? $version : null
			);
			return;
		}

		// Meta fallback — inline style tag.
		$css = $this->store->get( $post_id );
		if ( '' !== $css ) {
			wp_register_style( "nivorax-page-{$post_id}", false ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
			wp_enqueue_style( "nivorax-page-{$post_id}" );
			wp_add_inline_style( "nivorax-page-{$post_id}", $css );
		}
	}
}
