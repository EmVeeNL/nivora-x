<?php

declare( strict_types=1 );

use NivoraX\Templates\AssignmentResolver;
use NivoraX\Templates\RequestContext;

/**
 * Build a condition rule array.
 *
 * @param string $object_type Condition object.
 * @param string $value       Condition value.
 * @param string $behavior    include|exclude.
 * @return array{behavior: string, object: string, value: string}
 */
function nivorax_rule( string $object_type, string $value = '', string $behavior = 'include' ): array {
	return [
		'behavior' => $behavior,
		'object'   => $object_type,
		'value'    => $value,
	];
}

describe(
	'AssignmentResolver precedence',
	function (): void {

		it(
			'returns null when no template matches',
			function (): void {
				$ctx       = new RequestContext( post_type: 'post', post_id: 5, is_singular: true );
				$templates = [ 10 => [ nivorax_rule( 'singular', '99' ) ] ];

				expect( ( new AssignmentResolver() )->resolve( $ctx, $templates ) )->toBeNull();
			}
		);

		it(
			'picks the most specific match (singular beats post_type beats entire_site)',
			function (): void {
				$ctx       = new RequestContext( post_type: 'post', post_id: 5, is_singular: true );
				$templates = [
					1 => [ nivorax_rule( 'entire_site' ) ],
					2 => [ nivorax_rule( 'post_type', 'post' ) ],
					3 => [ nivorax_rule( 'singular', '5' ) ],
				];

				expect( ( new AssignmentResolver() )->resolve( $ctx, $templates ) )->toBe( 3 );
			}
		);

		it(
			'falls through to the post_type template when no singular rule matches',
			function (): void {
				$ctx       = new RequestContext( post_type: 'post', post_id: 7, is_singular: true );
				$templates = [
					1 => [ nivorax_rule( 'entire_site' ) ],
					2 => [ nivorax_rule( 'post_type', 'post' ) ],
					3 => [ nivorax_rule( 'singular', '5' ) ],
				];

				expect( ( new AssignmentResolver() )->resolve( $ctx, $templates ) )->toBe( 2 );
			}
		);

		it(
			'excludes a template when an exclude rule matches, even with a broad include',
			function (): void {
				$ctx       = new RequestContext( post_type: 'post', post_id: 5, is_singular: true );
				$templates = [
					1 => [
						nivorax_rule( 'entire_site' ),
						nivorax_rule( 'singular', '5', 'exclude' ),
					],
				];

				expect( ( new AssignmentResolver() )->resolve( $ctx, $templates ) )->toBeNull();
			}
		);

		it(
			'matches taxonomy archives via term refs',
			function (): void {
				$ctx       = new RequestContext(
					post_type: 'post',
					is_archive: true,
					term_refs: [ 'category:3' ],
				);
				$templates = [
					1 => [ nivorax_rule( 'archive', 'post' ) ],
					2 => [ nivorax_rule( 'taxonomy', 'category:3' ) ],
				];

				expect( ( new AssignmentResolver() )->resolve( $ctx, $templates ) )->toBe( 2 );
			}
		);

		it(
			'matches any archive when the archive rule value is empty',
			function (): void {
				$ctx       = new RequestContext( post_type: 'product', is_archive: true );
				$templates = [ 4 => [ nivorax_rule( 'archive', '' ) ] ];

				expect( ( new AssignmentResolver() )->resolve( $ctx, $templates ) )->toBe( 4 );
			}
		);

		it(
			'breaks ties deterministically toward the higher id',
			function (): void {
				$ctx       = new RequestContext( post_type: 'post', is_archive: true );
				$templates = [
					7 => [ nivorax_rule( 'post_type', 'post' ) ],
					9 => [ nivorax_rule( 'post_type', 'post' ) ],
				];

				expect( ( new AssignmentResolver() )->resolve( $ctx, $templates ) )->toBe( 9 );
			}
		);

		it(
			'does not match a post_type rule across different post types',
			function (): void {
				$ctx       = new RequestContext( post_type: 'page', post_id: 2, is_singular: true );
				$templates = [ 1 => [ nivorax_rule( 'post_type', 'post' ) ] ];

				expect( ( new AssignmentResolver() )->resolve( $ctx, $templates ) )->toBeNull();
			}
		);
	}
);
