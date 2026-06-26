<?php

declare( strict_types=1 );

namespace NivoraX\Templates;

use NivoraX\Css\CssGenerator;
use NivoraX\Render\RendererFactory;
use NivoraX\Render\TreeRenderer;
use NivoraX\Settings\Breakpoints;
use NivoraX\Tokens\Tokens;

defined( 'ABSPATH' ) || exit;

/**
 * Overrides the WordPress template hierarchy with NivoraX templates.
 *
 * For a front-end request it resolves the most-specific header / content /
 * footer templates (via {@see AssignmentResolver}), renders them with the
 * Phase 10 renderer, composes the page, and serves it through the plugin's
 * canvas template. When no NivoraX content template matches, the theme renders
 * normally (no breakage). A `nivorax_disable_template_override` filter gives a
 * per-request opt-out.
 */
final class TemplateHierarchy {

	/**
	 * Composed page HTML, populated by maybe_override() for the canvas template.
	 *
	 * @var string
	 */
	private static string $composed = '';

	/**
	 * Combined generated CSS for the rendered templates.
	 *
	 * @var string
	 */
	private static string $css = '';

	/**
	 * Whether this request is being served by NivoraX.
	 *
	 * @var bool
	 */
	private static bool $active = false;

	/** Hook the template hierarchy + CSS enqueue. */
	public static function register(): void {
		add_filter( 'template_include', [ self::class, 'maybe_override' ], 99 );
		add_action( 'wp_enqueue_scripts', [ self::class, 'enqueue_css' ] );
	}

	/**
	 * Decide whether to override the resolved theme template.
	 *
	 * @param string $template The theme template path WordPress resolved.
	 * @return string Path to the NivoraX canvas template, or the original.
	 */
	public static function maybe_override( string $template ): string {
		if ( is_admin() || is_feed() || is_robots() ) {
			return $template;
		}
		/** This filter allows themes/plugins to opt a request out of NivoraX. */
		if ( apply_filters( 'nivorax_disable_template_override', false ) ) {
			return $template;
		}

		$context      = self::build_context();
		$content_type = self::content_type_for( $context );
		if ( null === $content_type ) {
			return $template;
		}

		$resolver   = new AssignmentResolver();
		$content_id = $resolver->resolve( $context, TemplateRepository::conditions_by_type( $content_type ) );
		if ( null === $content_id ) {
			return $template; // No content template matches — let the theme render.
		}

		$header_id = $resolver->resolve( $context, TemplateRepository::conditions_by_type( TemplateModel::TYPE_HEADER ) );
		$footer_id = $resolver->resolve( $context, TemplateRepository::conditions_by_type( TemplateModel::TYPE_FOOTER ) );

		$registry = RendererFactory::make();
		$renderer = new TreeRenderer( $registry );

		$trees = array_filter(
			[
				null !== $header_id ? TemplateRepository::tree( $header_id ) : null,
				TemplateRepository::tree( $content_id ),
				null !== $footer_id ? TemplateRepository::tree( $footer_id ) : null,
			]
		);

		self::$composed = self::compose(
			null !== $header_id ? $renderer->render( TemplateRepository::tree( $header_id ) ?? new \stdClass() ) : '',
			$renderer->render( TemplateRepository::tree( $content_id ) ?? new \stdClass() ),
			null !== $footer_id ? $renderer->render( TemplateRepository::tree( $footer_id ) ?? new \stdClass() ) : '',
		);
		self::$css      = self::generate_css( $trees );
		self::$active   = true;

		return self::canvas_path();
	}

	/**
	 * Which content-template type a request needs, or null when none applies.
	 *
	 * @param RequestContext $context The request being served.
	 * @return string|null One of single|archive|404|search, or null.
	 */
	public static function content_type_for( RequestContext $context ): ?string {
		if ( $context->is_404 ) {
			return TemplateModel::TYPE_404;
		}
		if ( $context->is_search ) {
			return TemplateModel::TYPE_SEARCH;
		}
		if ( $context->is_singular ) {
			return TemplateModel::TYPE_SINGLE;
		}
		if ( $context->is_archive ) {
			return TemplateModel::TYPE_ARCHIVE;
		}
		return null;
	}

	/**
	 * Compose the page from rendered header/content/footer fragments.
	 *
	 * @param string $header  Rendered header HTML (may be empty).
	 * @param string $content Rendered content-template HTML.
	 * @param string $footer  Rendered footer HTML (may be empty).
	 * @return string
	 */
	public static function compose( string $header, string $content, string $footer ): string {
		return sprintf(
			'<div class="nivorax-template-root">%s<main class="nivorax-template-content">%s</main>%s</div>',
			$header,
			$content,
			$footer
		);
	}

	/** The composed page HTML for the canvas template. */
	public static function composed_html(): string {
		return self::$composed;
	}

	/** Enqueue the combined template CSS as an inline stylesheet. */
	public static function enqueue_css(): void {
		if ( ! self::$active || '' === self::$css ) {
			return;
		}
		wp_register_style( 'nivorax-template', false ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		wp_enqueue_style( 'nivorax-template' );
		wp_add_inline_style( 'nivorax-template', self::$css );
	}

	/**
	 * Build the request context from the main query.
	 *
	 * @return RequestContext
	 */
	private static function build_context(): RequestContext {
		$post_id   = is_singular() ? (int) get_queried_object_id() : 0;
		$post_type = '';

		if ( is_singular() ) {
			$post_type = (string) get_post_type( $post_id );
		} elseif ( is_post_type_archive() ) {
			$queried   = get_query_var( 'post_type' );
			$post_type = is_string( $queried ) ? $queried : (string) ( is_array( $queried ) ? reset( $queried ) : '' );
		}

		return new RequestContext(
			post_type: $post_type,
			post_id: $post_id,
			is_singular: is_singular(),
			is_archive: is_archive() || is_home(),
			is_404: is_404(),
			is_search: is_search(),
			term_refs: self::term_refs( $post_id ),
		);
	}

	/**
	 * Gather `taxonomy:term_id` refs for the request.
	 *
	 * @param int $post_id Queried post id (0 for non-singular).
	 * @return array<int, string>
	 */
	private static function term_refs( int $post_id ): array {
		$refs = [];

		if ( $post_id > 0 ) {
			foreach ( get_object_taxonomies( (string) get_post_type( $post_id ) ) as $taxonomy ) {
				$terms = wp_get_object_terms( $post_id, $taxonomy, [ 'fields' => 'ids' ] );
				if ( is_array( $terms ) ) {
					foreach ( $terms as $term_id ) {
						$refs[] = $taxonomy . ':' . (int) $term_id;
					}
				}
			}
		} elseif ( is_category() || is_tag() || is_tax() ) {
			$queried = get_queried_object();
			if ( $queried instanceof \WP_Term ) {
				$refs[] = $queried->taxonomy . ':' . $queried->term_id;
			}
		}

		return $refs;
	}

	/**
	 * Generate combined CSS for the rendered trees.
	 *
	 * @param array<int, object> $trees Rendered document trees.
	 * @return string
	 */
	private static function generate_css( array $trees ): string {
		$generator   = new CssGenerator();
		$breakpoints = Breakpoints::all();
		$tokens      = Tokens::all();

		$css = '';
		foreach ( $trees as $tree ) {
			$css .= $generator->generate( $tree, $breakpoints, $tokens );
		}

		return $css;
	}

	/** Absolute path to the canvas output template. */
	private static function canvas_path(): string {
		return NIVORAX_PLUGIN_DIR . 'templates/canvas.php';
	}
}
