<?php

declare( strict_types=1 );

/*
 * Pest bootstrap helpers — applies globally to all test files.
 *
 * Brain Monkey is set up/torn down per test so WP function mocks don't bleed
 * between tests.
 */

uses()->beforeEach( function (): void {
	Brain\Monkey\setUp();
} )->afterEach( function (): void {
	Brain\Monkey\tearDown();
} )->in( 'Unit' );
