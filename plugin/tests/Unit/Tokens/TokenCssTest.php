<?php

declare( strict_types=1 );

use NivoraX\Tokens\TokenCss;

describe(
	'TokenCss',
	function (): void {

		it(
			'value_to_css() returns a plain string as-is',
			function (): void {
				expect( TokenCss::value_to_css( '#3b82f6' ) )->toBe( '#3b82f6' );
			}
		);

		it(
			'value_to_css() serialises an array unit-value',
			function (): void {
				expect(
					TokenCss::value_to_css(
						[
							'value' => 16,
							'unit'  => 'px',
						]
					)
				)->toBe( '16px' );
			}
		);

		it(
			'value_to_css() serialises an object unit-value',
			function (): void {
				$obj        = new stdClass();
				$obj->value = 24;
				$obj->unit  = 'px';
				expect( TokenCss::value_to_css( $obj ) )->toBe( '24px' );
			}
		);

		it(
			'value_to_css() returns empty string for unsupported values',
			function (): void {
				expect( TokenCss::value_to_css( null ) )->toBe( '' );
				expect( TokenCss::value_to_css( [] ) )->toBe( '' );
			}
		);

		it(
			'to_css_vars() emits a :root block with one variable per token',
			function (): void {
				$tokens = [
					[
						'id'    => 'color-primary',
						'group' => 'color',
						'name'  => 'Primary',
						'value' => '#3b82f6',
					],
					[
						'id'    => 'spacing-md',
						'group' => 'spacing',
						'name'  => 'Medium',
						'value' => [
							'value' => 16,
							'unit'  => 'px',
						],
					],
				];
				$css    = TokenCss::to_css_vars( $tokens );
				expect( $css )->toContain( ':root{' )
					->and( $css )->toContain( '--nx-color-primary:#3b82f6' )
					->and( $css )->toContain( '--nx-spacing-md:16px' );
			}
		);

		it(
			'to_css_vars() returns empty string for an empty list',
			function (): void {
				expect( TokenCss::to_css_vars( [] ) )->toBe( '' );
			}
		);

		it(
			'to_css_vars() uses the token id as the variable name',
			function (): void {
				$tokens = [
					[
						'id'    => 'my-token',
						'group' => 'color',
						'name'  => 'My Token',
						'value' => '#fff',
					],
				];
				$css    = TokenCss::to_css_vars( $tokens );
				expect( $css )->toContain( '--nx-my-token:#fff' );
			}
		);
	}
);
