<?php

declare( strict_types=1 );

namespace NivoraX\Rest;

use NivoraX\Capabilities\Capabilities;
use NivoraX\Tokens\Tokens;

defined( 'ABSPATH' ) || exit;

/**
 * REST controller for site-wide design tokens.
 *
 * Routes:
 *   GET  /nivorax/v1/tokens  → { tokens: DesignToken[] }
 *   PUT  /nivorax/v1/tokens  → { tokens: DesignToken[] }
 */
final class TokensController {

	public const NAMESPACE = 'nivorax/v1';
	public const ROUTE     = '/tokens';

	/** Register REST routes on rest_api_init. */
	public static function register(): void {
		add_action( 'rest_api_init', [ self::class, 'register_routes' ] );
	}

	/**
	 * Register REST routes.
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
					'callback'            => [ self::class, 'get_tokens' ],
					'permission_callback' => [ self::class, 'check_read_permission' ],
				],
				[
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => [ self::class, 'save_tokens' ],
					'permission_callback' => [ self::class, 'check_write_permission' ],
				],
			]
		);
	}

	/** Read requires editor-level access (tokens affect site-wide styling). */
	public static function check_read_permission(): bool {
		return Capabilities::current_user_can_manage();
	}

	/** Write requires manage capability. */
	public static function check_write_permission(): bool {
		return Capabilities::current_user_can_manage();
	}

	/**
	 * Return the current token list.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_tokens(): \WP_REST_Response {
		return rest_ensure_response( [ 'tokens' => Tokens::all() ] );
	}

	/**
	 * Persist an updated token list.
	 *
	 * @param \WP_REST_Request $request Incoming request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function save_tokens( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		$params = $request->get_json_params();

		if ( ! is_array( $params ) || ! isset( $params['tokens'] ) || ! is_array( $params['tokens'] ) ) {
			return new \WP_Error( 'invalid_body', 'Request body must be a JSON object with a "tokens" array.', [ 'status' => 400 ] );
		}

		$saved = Tokens::save( $params['tokens'] );

		if ( ! $saved ) {
			$stored = Tokens::all();
			if ( Tokens::sanitize( $params['tokens'] ) !== $stored ) {
				return new \WP_Error( 'tokens_save_failed', 'Failed to save tokens.', [ 'status' => 500 ] );
			}
		}

		return rest_ensure_response( [ 'tokens' => Tokens::all() ] );
	}
}
