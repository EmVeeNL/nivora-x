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
		$meta     = $envelope->meta;
		if ( ! isset( $meta['title'] ) ) {
			$meta['title'] = get_the_title( $post_id );
		}

		return rest_ensure_response(
			[
				'version' => $envelope->version,
				'tree'    => $envelope->tree,
				'meta'    => $meta,
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

		// Decode without associative flag so empty JSON objects ({}) remain as
		// stdClass instances. get_json_params() uses json_decode($body, true)
		// which converts {} to [] — that empty PHP array then re-encodes as a
		// JSON array [], breaking the JS schema validator on reload.
		$body = json_decode( $request->get_body() );

		if ( ! is_object( $body ) ) {
			return new \WP_Error( 'invalid_body', 'Request body must be a JSON object.', [ 'status' => 400 ] );
		}

		$version = isset( $body->version ) && is_int( $body->version )
			? $body->version
			: Envelope::CURRENT_VERSION;
		$tree    = $body->tree ?? null;
		$meta    = isset( $body->meta ) && is_object( $body->meta ) ? (array) $body->meta : [];
		$publish = ! empty( $body->publish );

		$envelope = new Envelope( $version, $tree, $meta );

		try {
			DocumentStore::write( $post_id, $envelope );
		} catch ( \RuntimeException $e ) {
			return new \WP_Error( 'save_failed', $e->getMessage(), [ 'status' => 403 ] );
		}

		$post_update = self::post_update_from_meta( $post_id, $meta, $publish );
		if ( count( $post_update ) > 1 ) {
			$result = wp_update_post( $post_update, true );
			if ( is_wp_error( $result ) ) {
				return new \WP_Error( 'post_update_failed', $result->get_error_message(), [ 'status' => 403 ] );
			}
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

	/**
	 * Build the post update payload implied by document metadata.
	 *
	 * @param int                  $post_id Post being edited.
	 * @param array<string, mixed> $meta    Document metadata.
	 * @param bool                 $publish Whether to publish the post.
	 * @return array<string, mixed>
	 */
	private static function post_update_from_meta( int $post_id, array $meta, bool $publish ): array {
		$update = [ 'ID' => $post_id ];

		if ( isset( $meta['title'] ) && is_string( $meta['title'] ) ) {
			$update['post_title'] = self::sanitize_document_title( $meta['title'] );
		}

		if ( $publish ) {
			$update['post_status'] = 'publish';
		}

		return $update;
	}

	/**
	 * Sanitize the document title with WordPress when available, falling back for unit tests.
	 *
	 * @param string $title Raw title from document metadata.
	 */
	private static function sanitize_document_title( string $title ): string {
		if ( function_exists( 'sanitize_text_field' ) ) {
			return sanitize_text_field( $title );
		}

		return trim( (string) preg_replace( '/<[^>]*>/', '', $title ) );
	}
}
