<?php

declare( strict_types=1 );

use Brain\Monkey\Functions;
use NivoraX\Settings\Breakpoints;

describe(
	'Breakpoints',
	function (): void {

		it(
			'returns desktop tablet and mobile defaults',
			function (): void {
				$defaults = Breakpoints::defaults();

				expect( array_column( $defaults, 'id' ) )->toBe( [ 'desktop', 'tablet', 'mobile' ] )
					->and( $defaults[0]['width'] )->toBe( 1440 )
					->and( $defaults[1]['width'] )->toBe( 768 )
					->and( $defaults[2]['width'] )->toBe( 375 );
			}
		);

		it(
			'sanitizes custom breakpoints and keeps desktop first',
			function (): void {
				Functions\when( 'sanitize_key' )->returnArg();
				Functions\when( 'sanitize_text_field' )->returnArg();
				Functions\when( 'absint' )->alias(
					static fn( mixed $value ): int => abs( (int) $value )
				);

				$sanitized = Breakpoints::sanitize_option(
					[
						[
							'id'    => 'laptop',
							'label' => 'Laptop',
							'width' => 1024,
						],
						[
							'id'    => 'desktop',
							'label' => 'Desktop XL',
							'width' => 1600,
						],
					]
				);

				expect( array_column( $sanitized, 'id' ) )->toBe(
					[ 'desktop', 'laptop', 'tablet', 'mobile' ]
				)->and( $sanitized[0]['label'] )->toBe( 'Desktop XL' )
					->and( $sanitized[1]['width'] )->toBe( 1024 );
			}
		);
	}
);
