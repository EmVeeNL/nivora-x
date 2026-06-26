<?php

declare( strict_types=1 );

namespace NivoraX\Templates;

defined( 'ABSPATH' ) || exit;

/**
 * An immutable description of the front-end request the assignment resolver
 * matches templates against.
 *
 * Task 006 builds one of these from the main WordPress query; the resolver and
 * its tests consume it directly so resolution is testable without WordPress.
 *
 * `$term_refs` is a flat list of `taxonomy:term_id` strings (the same format a
 * taxonomy condition rule's value uses) covering both the current object's terms
 * (on singular requests) and the queried term (on taxonomy archives).
 */
final class RequestContext {

	/**
	 * Build an immutable request context.
	 *
	 * @param string             $post_type   Post type in scope (singular post or archive post type).
	 * @param int                $post_id     Queried post id on singular requests, else 0.
	 * @param bool               $is_singular Whether this is a singular (single post/page) request.
	 * @param bool               $is_archive  Whether this is an archive request.
	 * @param bool               $is_404      Whether this is a 404 request.
	 * @param bool               $is_search   Whether this is a search-results request.
	 * @param array<int, string> $term_refs `taxonomy:term_id` refs relevant to the request.
	 */
	public function __construct(
		public readonly string $post_type = '',
		public readonly int $post_id = 0,
		public readonly bool $is_singular = false,
		public readonly bool $is_archive = false,
		public readonly bool $is_404 = false,
		public readonly bool $is_search = false,
		public readonly array $term_refs = [],
	) {}
}
