<?php

declare( strict_types=1 );

namespace NivoraX\Rest;

use NivoraX\Admin\Settings\SettingsPage;
use NivoraX\Capabilities\Capabilities;
use NivoraX\Settings\Breakpoints;
use NivoraX\Settings\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * REST controller for site-wide NivoraX settings used by the editor.
 */
final class SettingsController {

	public const NAMESPACE = 'nivorax/v1';
	public const ROUTE     = '/settings/breakpoints';

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
					'callback'            => [ self::class, 'get_breakpoints' ],
					'permission_callback' => [ self::class, 'check_permission' ],
				],
				[
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => [ self::class, 'save_breakpoints' ],
					'permission_callback' => [ self::class, 'check_permission' ],
				],
			]
		);
	}

	/** Whether the current user can manage NivoraX settings. */
	public static function check_permission(): bool {
		return Capabilities::current_user_can_manage();
	}

	/**
	 * Return the current normalized breakpoint configuration.
	 */
	public static function get_breakpoints(): \WP_REST_Response {
		return rest_ensure_response(
			[
				'breakpoints' => Breakpoints::all(),
			]
		);
	}

	/**
	 * Persist the submitted breakpoint list in the plugin option.
	 *
	 * @param \WP_REST_Request $request Incoming request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function save_breakpoints( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			return new \WP_Error( 'invalid_body', 'Request body must be a JSON object.', [ 'status' => 400 ] );
		}

		$options                = SettingsPage::get_options();
		$options['breakpoints'] = Breakpoints::sanitize_option( $params['breakpoints'] ?? [] );

		$updated = update_option( SettingsPage::OPTION_KEY, $options );
		if ( false === $updated && SettingsPage::get_options()['breakpoints'] !== $options['breakpoints'] ) {
			return new \WP_Error( 'settings_save_failed', 'Failed to save breakpoint settings.', [ 'status' => 500 ] );
		}

		Settings::flush();

		return rest_ensure_response(
			[
				'breakpoints' => Breakpoints::all(),
			]
		);
	}
}
