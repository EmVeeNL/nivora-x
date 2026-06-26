<?php

declare( strict_types=1 );

namespace NivoraX\Rest;

use NivoraX\Admin\Screen\EditorScreen;
use NivoraX\Capabilities\Capabilities;
use NivoraX\Editor\EditorMode;
use NivoraX\Templates\TemplateModel;
use NivoraX\Templates\TemplatePostType;

defined( 'ABSPATH' ) || exit;

/**
 * REST controller backing the in-editor Theme Builder panel.
 *
 * Routes:
 *   GET    /nivorax/v1/templates           → { templates: TemplateSummary[] }
 *   POST   /nivorax/v1/templates           → { template: TemplateSummary }
 *   DELETE /nivorax/v1/templates/{id}       → { deleted: true }
 *
 * A TemplateSummary is { id, title, type, status, editUrl }. `editUrl` is a
 * ready-to-open NivoraX editor URL (nonce included) so the panel can route the
 * browser straight into editing the template.
 */
final class TemplatesController {

	public const NAMESPACE = 'nivorax/v1';
	public const ROUTE     = '/templates';

	/** Register REST routes on rest_api_init. */
	public static function register(): void {
		add_action( 'rest_api_init', [ self::class, 'register_routes' ] );
	}

	/**
	 * Register the collection + single-item routes.
	 *
	 * @internal
	 */
	public static function register_routes(): void {
		register_rest_route(
			self::NAMESPACE,
			self::ROUTE,
			[
				[
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => [ self::class, 'list_templates' ],
					'permission_callback' => [ self::class, 'check_permission' ],
				],
				[
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => [ self::class, 'create_template' ],
					'permission_callback' => [ self::class, 'check_permission' ],
				],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			self::ROUTE . '/(?P<id>\d+)',
			[
				[
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => [ self::class, 'delete_template' ],
					'permission_callback' => [ self::class, 'check_permission' ],
					'args'                => [
						'id' => [
							'validate_callback' => static fn( $value ): bool => is_numeric( $value ),
						],
					],
				],
			]
		);
	}

	/** All template management requires editor-level access. */
	public static function check_permission(): bool {
		return Capabilities::current_user_can_edit();
	}

	/**
	 * Return every template as a summary array.
	 *
	 * @return \WP_REST_Response
	 */
	public static function list_templates(): \WP_REST_Response {
		$posts = get_posts(
			[
				'post_type'      => TemplatePostType::POST_TYPE,
				'post_status'    => [ 'publish', 'draft' ],
				'posts_per_page' => 100,
				'orderby'        => 'date',
				'order'          => 'DESC',
			]
		);

		$templates = [];
		foreach ( $posts as $post ) {
			if ( $post instanceof \WP_Post ) {
				$templates[] = self::summarize( $post );
			}
		}

		return rest_ensure_response( [ 'templates' => $templates ] );
	}

	/**
	 * Create a template of the requested type and return its summary.
	 *
	 * @param \WP_REST_Request $request Incoming request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function create_template( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		$params = $request->get_json_params();
		$type   = is_array( $params ) && isset( $params['type'] ) ? sanitize_key( (string) $params['type'] ) : '';
		$title  = is_array( $params ) && isset( $params['title'] ) ? sanitize_text_field( (string) $params['title'] ) : '';

		if ( ! TemplateModel::is_valid_type( $type ) ) {
			return new \WP_Error( 'invalid_type', 'Unsupported template type.', [ 'status' => 400 ] );
		}

		$post_id = wp_insert_post(
			[
				'post_title'  => '' !== $title ? $title : self::default_title( $type ),
				'post_type'   => TemplatePostType::POST_TYPE,
				'post_status' => 'publish',
			],
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return new \WP_Error( 'create_failed', $post_id->get_error_message(), [ 'status' => 500 ] );
		}

		TemplateModel::set_type( $post_id, $type );
		EditorMode::set_nivorax( $post_id );

		$post = get_post( $post_id );
		if ( ! $post instanceof \WP_Post ) {
			return new \WP_Error( 'create_failed', 'Template could not be loaded after creation.', [ 'status' => 500 ] );
		}

		return rest_ensure_response( [ 'template' => self::summarize( $post ) ] );
	}

	/**
	 * Delete a template.
	 *
	 * @param \WP_REST_Request $request Incoming request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function delete_template( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		$id = (int) $request['id'];

		if ( TemplatePostType::POST_TYPE !== get_post_type( $id ) ) {
			return new \WP_Error( 'not_found', 'Template not found.', [ 'status' => 404 ] );
		}
		if ( ! Capabilities::user_can_edit_post( $id ) ) {
			return new \WP_Error( 'forbidden', 'You cannot delete this template.', [ 'status' => 403 ] );
		}

		wp_delete_post( $id, true );

		return rest_ensure_response( [ 'deleted' => true ] );
	}

	/**
	 * Map a template post to its summary payload.
	 *
	 * @param \WP_Post $post Template post.
	 * @return array{id: int, title: string, type: string, status: string, editUrl: string}
	 */
	private static function summarize( \WP_Post $post ): array {
		return [
			'id'      => $post->ID,
			'title'   => get_the_title( $post ),
			'type'    => TemplateModel::get_type( $post->ID ),
			'status'  => (string) get_post_status( $post ),
			'editUrl' => EditorScreen::url( $post->ID ),
		];
	}

	/**
	 * Fallback title for a blank name.
	 *
	 * @param string $type Template type.
	 */
	private static function default_title( string $type ): string {
		/* translators: %s: template type slug. */
		return sprintf( __( 'Untitled %s', 'nivorax' ), ucfirst( $type ) );
	}
}
