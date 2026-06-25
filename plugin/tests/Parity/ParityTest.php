<?php
/**
 * Cross-producer parity test — PHP side.
 *
 * Loads every fixture from fixtures/parity/*.json and asserts that
 * CssGenerator::generate() produces exactly the "css" string recorded in
 * the fixture.
 *
 * The JS-side counterpart (app/__tests__/phase-10/007-parity.test.ts) runs
 * the same fixtures through generateCss() in TypeScript. Both suites must
 * pass for the parity guarantee to hold.
 *
 * @package NivoraX\Tests\Parity
 */

declare( strict_types=1 );

use NivoraX\Css\CssGenerator;

$parity_fixtures_dir = dirname( __DIR__, 3 ) . '/fixtures/parity';
$parity_files        = glob( $parity_fixtures_dir . '/*.json' );

if ( false !== $parity_files ) {
	sort( $parity_files );

	foreach ( $parity_files as $parity_path ) {
		$parity_content = file_get_contents( $parity_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if ( false === $parity_content ) {
			continue;
		}

		$parity_fixture = json_decode( $parity_content );
		if ( ! is_object( $parity_fixture ) ) {
			continue;
		}

		$parity_name = basename( $parity_path, '.json' );

		it(
			"{$parity_name}: {$parity_fixture->description}",
			function () use ( $parity_fixture ): void {
				$gen         = new CssGenerator();
				$breakpoints = json_decode( (string) json_encode( $parity_fixture->breakpoints ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode
				$tree        = $parity_fixture->tree;

				$actual = $gen->generate( $tree, $breakpoints );
				expect( $actual )->toBe( $parity_fixture->css );
			}
		);
	}
}
