<?php

declare( strict_types=1 );

namespace NivoraX\Rest;

use NivoraX\Capabilities\Capabilities;
use NivoraX\Storage\DocumentStore;
use NivoraX\Storage\Envelope;

defined( 'ABSPATH' ) || exit;

/**
 * REST controller for the NivoraX document resource.
 *
 * Routes:
 *   GET  /nivorax/v1/documents/{id}  — Read stored document envelope.
 *   PUT  /nivorax/v1/documents/{id}  — Write document; pass `publish: true` to publish.
 *
 * Reuses the Phase 02 storage contract (DocumentStore + Envelope) — this controller
 * is a thin, capability-gated HTTP wrapper with no new storage logic.
 */
final class DocumentController {

	public const NAMESPACE = 'nivorax/v1';
	public const ROUTE     = '/documents/(?P<id>[\d]+)';

	/** Registers the REST routes on rest_api_init. */
	public static function register(): void {
		add_action( 'rest_api_init', [ self::class, 'register_routes' ] );
	}

	/**
	 * Register REST routes. Called via rest_api_init.
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
					'callback'            => [ self::class, 'get_document' ],
					'permission_callback' => [ self::class, 'check_permission' ],
					'args'                => self::id_arg(),
				],
				[
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => [ self::class, 'save_document' ],
					'permission_callback' => [ self::class, 'check_permission' ],
					'args'                => self::id_arg(),
				],
			]
		);
	}

	/**
	 * Permission callback — checks that the current user can edit the post.
	 *
	 * @param \WP_REST_Request $request Incoming request.
	 */
	public static function check_permission( \WP_REST_Request $request ): bool {
		return Capabilities::user_can_edit_post( (int) $request->get_param( 'id' ) );
	}

	/**
	 * GET handler — returns the stored envelope for the post.
	 *
	 * @param \WP_REST_Request $request Incoming request.
	 */
	public static function get_document( \WP_REST_Request $request ): \WP_REST_Response {
		$post_id  = (int) $request->get_param( 'id' );
		$envelope = DocumentStore::read( $post_id );

		return rest_ensure_response(
			[
				'version' => $envelope->version,
				'tree'    => $envelope->tree,
				'meta'    => $envelope->meta,
			]
		);
	}

	/**
	 * PUT handler — writes the envelope to post meta.
	 * Accepts optional `publish: true` to set the post status to "publish".
	 *
	 * @param \WP_REST_Request $request Incoming request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function save_document( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		$post_id = (int) $request->get_param( 'id' );
		$body    = $request->get_json_params();

		if ( ! is_array( $body ) ) {
			return new \WP_Error( 'invalid_body', 'Request body must be a JSON object.', [ 'status' => 400 ] );
		}

		$version = isset( $body['version'] ) && is_int( $body['version'] )
			? $body['version']
			: Envelope::CURRENT_VERSION;
		$tree    = $body['tree'] ?? null;
		$meta    = isset( $body['meta'] ) && is_array( $body['meta'] ) ? $body['meta'] : [];
		$publish = ! empty( $body['publish'] );

		$envelope = new Envelope( $version, $tree, $meta );

		try {
			DocumentStore::write( $post_id, $envelope );
		} catch ( \RuntimeException $e ) {
			return new \WP_Error( 'save_failed', $e->getMessage(), [ 'status' => 403 ] );
		}

		if ( $publish ) {
			wp_update_post(
				[
					'ID'          => $post_id,
					'post_status' => 'publish',
				]
			);
		}

		return rest_ensure_response(
			[
				'saved'   => true,
				'version' => $version,
			]
		);
	}

	/**
	 * Shared argument definition for the {id} URL parameter.
	 *
	 * @return array<string, mixed>
	 */
	private static function id_arg(): array {
		return [
			'id' => [
				'validate_callback' => static fn( mixed $v ): bool => is_numeric( $v ) && (int) $v > 0,
			],
		];
	}
}
