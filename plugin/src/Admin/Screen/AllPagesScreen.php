<?php

declare( strict_types=1 );

namespace NivoraX\Admin\Screen;

use NivoraX\Editor\EditorMode;
use NivoraX\Settings\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * "All Pages" admin screen — native list augmented with NivoraX state.
 */
final class AllPagesScreen {

	/** Hooks column, filter, and query-modification callbacks. */
	public static function register(): void {
		// Augment the native pages list with a NivoraX column.
		add_filter( 'manage_page_posts_columns', [ self::class, 'add_column' ] );
		add_action( 'manage_page_posts_custom_column', [ self::class, 'render_column' ], 10, 2 );
		add_filter( 'manage_edit-page_sortable_columns', [ self::class, 'sortable_columns' ] );

		// Filter dropdown for NivoraX-built pages.
		add_action( 'restrict_manage_posts', [ self::class, 'render_filter' ] );
		add_action( 'parse_query', [ self::class, 'apply_filter' ] );
	}

	/** Renders the paginated page list with NivoraX status indicators. */
	public static function render(): void {
		$enabled = Settings::instance()->get_enabled_post_types();
		?>
		<div class="wrap">
			<h1 class="wp-heading-inline"><?php esc_html_e( 'All Pages', 'nivorax' ); ?></h1>
			<a href="<?php echo esc_url( admin_url( 'admin.php?page=nivorax-new-page' ) ); ?>"
				class="page-title-action">
				<?php esc_html_e( 'Add New', 'nivorax' ); ?>
			</a>
			<hr class="wp-header-end">
			<?php if ( empty( $enabled ) ) : ?>
				<p><?php esc_html_e( 'No post types are enabled for NivoraX yet. Configure them in Settings.', 'nivorax' ); ?></p>
			<?php else : ?>
				<?php
				// Delegate to the native WP_List_Table for the page post type.
				// The extra column + filter are injected via hooks registered in register().
				$args = [
					'post_type'      => 'page',
					'posts_per_page' => 20,
					'post_status'    => [ 'publish', 'draft', 'pending', 'private' ],
				];

				// phpcs:ignore WordPress.Security.NonceVerification.Recommended
				if ( isset( $_GET['nivorax_mode'] ) && 'nivorax' === $_GET['nivorax_mode'] ) {
					// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
					$args['meta_key'] = EditorMode::META_KEY;
					// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
					$args['meta_value'] = EditorMode::MODE_NIVORAX;
				}

				$query = new \WP_Query( $args );
				echo '<table class="wp-list-table widefat fixed striped table-view-list posts">';
				echo '<thead><tr>';
				echo '<th>' . esc_html__( 'Title', 'nivorax' ) . '</th>';
				echo '<th>' . esc_html__( 'NivoraX', 'nivorax' ) . '</th>';
				echo '<th>' . esc_html__( 'Status', 'nivorax' ) . '</th>';
				echo '</tr></thead><tbody>';

				while ( $query->have_posts() ) {
					$query->the_post();
					$post_id = get_the_ID();
					if ( false === $post_id ) {
						continue;
					}
					$mode       = EditorMode::get( $post_id );
					$edit_url   = EditorScreen::url( $post_id );
					$is_nivorax = EditorMode::MODE_NIVORAX === $mode;

					echo '<tr>';
					echo '<td><a href="' . esc_url( $edit_url ) . '">' . esc_html( get_the_title() ) . '</a></td>';
					echo '<td>' . ( $is_nivorax ? '<span class="dashicons dashicons-yes" title="NivoraX"></span>' : '—' ) . '</td>';
					echo '<td>' . esc_html( ucfirst( (string) get_post_status() ) ) . '</td>';
					echo '</tr>';
				}

				wp_reset_postdata();

				echo '</tbody></table>';
				?>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Adds the NivoraX column to the page list table.
	 *
	 * @param array<string, string> $columns Existing columns.
	 * @return array<string, string>
	 */
	public static function add_column( array $columns ): array {
		$columns['nivorax'] = __( 'NivoraX', 'nivorax' );
		return $columns;
	}

	/**
	 * Renders the NivoraX mode indicator for each row.
	 *
	 * @param string     $column  Column name.
	 * @param int|string $post_id Post ID.
	 */
	public static function render_column( string $column, int|string $post_id ): void {
		if ( 'nivorax' !== $column ) {
			return;
		}
		$mode = EditorMode::get( (int) $post_id );
		if ( EditorMode::MODE_NIVORAX === $mode ) {
			echo '<span class="dashicons dashicons-yes" title="' . esc_attr__( 'Built with NivoraX', 'nivorax' ) . '"></span>';
		} else {
			echo '—';
		}
	}

	/**
	 * Registers the NivoraX column as sortable.
	 *
	 * @param array<string, string> $columns Existing sortable columns.
	 * @return array<string, string>
	 */
	public static function sortable_columns( array $columns ): array {
		$columns['nivorax'] = 'nivorax';
		return $columns;
	}

	/**
	 * Renders the NivoraX mode filter dropdown above the page list.
	 *
	 * @param string $post_type Current list-table post type.
	 */
	public static function render_filter( string $post_type ): void {
		if ( 'page' !== $post_type ) {
			return;
		}
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$current = isset( $_GET['nivorax_mode'] ) ? sanitize_key( $_GET['nivorax_mode'] ) : '';
		?>
		<select name="nivorax_mode">
			<option value=""><?php esc_html_e( 'All pages', 'nivorax' ); ?></option>
			<option value="nivorax" <?php selected( $current, 'nivorax' ); ?>>
				<?php esc_html_e( 'Built with NivoraX', 'nivorax' ); ?>
			</option>
		</select>
		<?php
	}

	/**
	 * Applies the nivorax_mode filter to the main query when set.
	 *
	 * @param \WP_Query $query The current query.
	 */
	public static function apply_filter( \WP_Query $query ): void {
		if ( ! is_admin() || ! $query->is_main_query() ) {
			return;
		}
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$mode = isset( $_GET['nivorax_mode'] ) ? sanitize_key( $_GET['nivorax_mode'] ) : '';
		if ( 'nivorax' !== $mode ) {
			return;
		}
		// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
		$query->set( 'meta_key', EditorMode::META_KEY );
		// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
		$query->set( 'meta_value', EditorMode::MODE_NIVORAX );
	}
}
