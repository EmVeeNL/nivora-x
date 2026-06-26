<?php

declare( strict_types=1 );

namespace NivoraX\Templates;

use NivoraX\Storage\DocumentStore;

defined( 'ABSPATH' ) || exit;

/**
 * Read-side helpers for resolving and loading templates on the front end.
 *
 * @phpstan-import-type ConditionRule from TemplateModel
 */
final class TemplateRepository {

	/**
	 * Map of `template id => conditions` for every published template of a type.
	 *
	 * @param string $type Template type (header/footer/single/…).
	 * @return array<int, array<int, ConditionRule>>
	 */
	public static function conditions_by_type( string $type ): array {
		if ( ! TemplateModel::is_valid_type( $type ) ) {
			return [];
		}

		$ids = get_posts(
			[
				'post_type'      => TemplatePostType::POST_TYPE,
				'post_status'    => 'publish',
				'posts_per_page' => 100,
				'fields'         => 'ids',
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'meta_key'       => TemplateModel::TYPE_META,
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
				'meta_value'     => $type,
			]
		);

		$result = [];
		foreach ( $ids as $id ) {
			$result[ (int) $id ] = TemplateModel::get_conditions( (int) $id );
		}

		return $result;
	}

	/**
	 * The decoded document tree for a template, or null when empty/missing.
	 *
	 * @param int $template_id Template post id.
	 * @return object|null
	 */
	public static function tree( int $template_id ): ?object {
		$tree = DocumentStore::read( $template_id )->tree;
		return is_object( $tree ) ? $tree : null;
	}
}
