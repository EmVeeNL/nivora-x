<?php

declare( strict_types=1 );

use Brain\Monkey\Functions;
use NivoraX\Admin\Settings\SettingsPage;

describe(
	'SettingsPage::sanitize',
	function (): void {

		it(
			'returns defaults for non-array input',
			function (): void {
				$result = SettingsPage::sanitize( 'not an array' );
				expect( $result )->toBe( SettingsPage::defaults() );
			}
		);

		it(
			'returns defaults for null',
			function (): void {
				$result = SettingsPage::sanitize( null );
				expect( $result )->toBe( SettingsPage::defaults() );
			}
		);

		it(
			'sanitizes editor_label as plain text',
			function (): void {
				// Stub get_post_types() so sanitize() can validate against the eligible list.
				$page_type       = new \stdClass();
				$page_type->name = 'page';
				Functions\when( 'get_post_types' )->justReturn( [ 'page' => $page_type ] );
				Functions\when( 'sanitize_text_field' )->returnArg();
				Functions\when( 'sanitize_key' )->returnArg();

				$result = SettingsPage::sanitize(
					[
						'enabled_post_types' => [ 'page' ],
						'editor_label'       => 'Edit with NivoraX',
					]
				);
				expect( $result['editor_label'] )->toBe( 'Edit with NivoraX' )
				->and( $result['enabled_post_types'] )->toContain( 'page' );
			}
		);

		it(
			'default options include page in enabled post types',
			function (): void {
				$defaults = SettingsPage::defaults();
				expect( $defaults['enabled_post_types'] )->toContain( 'page' );
			}
		);
	}
);
