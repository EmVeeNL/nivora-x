<?php

declare( strict_types=1 );

use Brain\Monkey\Functions;
use NivoraX\Templates\TemplateModel;
use NivoraX\Templates\TemplatePostType;

describe(
	'TemplateModel constants + types',
	function (): void {

		it(
			'exposes the supported template types',
			function (): void {
				expect( TemplateModel::valid_types() )->toBe(
					[ 'header', 'footer', 'single', 'archive', '404', 'search' ]
				);
			}
		);

		it(
			'defines distinct meta keys for type and conditions',
			function (): void {
				expect( TemplateModel::TYPE_META )->toBe( '_nivorax_template_type' )
				->and( TemplateModel::CONDITIONS_META )->toBe( '_nivorax_template_conditions' )
				->and( TemplatePostType::POST_TYPE )->toBe( 'nivorax_template' );
			}
		);

		it(
			'validates supported and rejects unsupported types',
			function (): void {
				expect( TemplateModel::is_valid_type( 'header' ) )->toBeTrue()
				->and( TemplateModel::is_valid_type( '404' ) )->toBeTrue()
				->and( TemplateModel::is_valid_type( 'nonsense' ) )->toBeFalse()
				->and( TemplateModel::is_valid_type( 42 ) )->toBeFalse();
			}
		);
	}
);

describe(
	'TemplateModel conditions normalization',
	function (): void {

		it(
			'drops rules with an unsupported object',
			function (): void {
				$rules = TemplateModel::normalize_conditions(
					[
						[
							'object' => 'post_type',
							'value'  => 'post',
						],
						[
							'object' => 'wat',
							'value'  => 'x',
						],
					]
				);
				expect( $rules )->toHaveCount( 1 )
				->and( $rules[0]['object'] )->toBe( 'post_type' );
			}
		);

		it(
			'defaults behavior to include and coerces unknown behaviors',
			function (): void {
				$rules = TemplateModel::normalize_conditions(
					[
						[
							'object' => 'singular',
							'value'  => 12,
						],
						[
							'behavior' => 'exclude',
							'object'   => 'taxonomy',
							'value'    => 'category:3',
						],
						[
							'behavior' => 'bogus',
							'object'   => 'archive',
							'value'    => 'post',
						],
					]
				);
				expect( $rules[0]['behavior'] )->toBe( 'include' )
				->and( $rules[0]['value'] )->toBe( '12' )
				->and( $rules[1]['behavior'] )->toBe( 'exclude' )
				->and( $rules[2]['behavior'] )->toBe( 'include' );
			}
		);

		it(
			'clears the value for entire_site rules',
			function (): void {
				$rules = TemplateModel::normalize_conditions(
					[
						[
							'object' => 'entire_site',
							'value'  => 'ignored',
						],
					]
				);
				expect( $rules[0]['object'] )->toBe( 'entire_site' )
				->and( $rules[0]['value'] )->toBe( '' );
			}
		);

		it(
			'returns an empty list for non-array payloads',
			function (): void {
				expect( TemplateModel::normalize_conditions( 'nope' ) )->toBe( [] )
				->and( TemplateModel::normalize_conditions( null ) )->toBe( [] );
			}
		);
	}
);

describe(
	'TemplateModel persistence',
	function (): void {

		it(
			'reads back a stored type',
			function (): void {
				Functions\when( 'get_post_meta' )->justReturn( 'header' );
				expect( TemplateModel::get_type( 7 ) )->toBe( 'header' );
			}
		);

		it(
			'returns empty string for an invalid stored type',
			function (): void {
				Functions\when( 'get_post_meta' )->justReturn( 'garbage' );
				expect( TemplateModel::get_type( 7 ) )->toBe( '' );
			}
		);

		it(
			'refuses to set an unsupported type',
			function (): void {
				Functions\expect( 'update_post_meta' )->never();
				expect( TemplateModel::set_type( 7, 'garbage' ) )->toBeFalse();
			}
		);

		it(
			'persists a valid type when the user can edit',
			function (): void {
				Functions\when( 'current_user_can' )->justReturn( true );
				Functions\expect( 'update_post_meta' )
					->once()
					->with( 7, TemplateModel::TYPE_META, 'header' )
					->andReturn( 123 );
				expect( TemplateModel::set_type( 7, 'header' ) )->toBeTrue();
			}
		);

		it(
			'normalizes conditions on read',
			function (): void {
				Functions\when( 'get_post_meta' )->justReturn(
					'[{"object":"post_type","value":"post"},{"object":"junk"}]'
				);
				$rules = TemplateModel::get_conditions( 7 );
				expect( $rules )->toHaveCount( 1 )
				->and( $rules[0]['object'] )->toBe( 'post_type' );
			}
		);

		it(
			'returns empty conditions when meta is unset',
			function (): void {
				Functions\when( 'get_post_meta' )->justReturn( '' );
				expect( TemplateModel::get_conditions( 7 ) )->toBe( [] );
			}
		);
	}
);
