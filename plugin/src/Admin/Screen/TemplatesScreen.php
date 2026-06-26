<?php

declare( strict_types=1 );

namespace NivoraX\Admin\Screen;

use NivoraX\Capabilities\Capabilities;
use NivoraX\Editor\EditorMode;
use NivoraX\Templates\TemplateModel;
use NivoraX\Templates\TemplatePostType;

defined( 'ABSPATH' ) || exit;

/**
 * "All Templates" admin screen — the theme-builder entry point.
 *
 * Lists `nivorax_template` posts grouped by type, with create (pick a type →
 * open the NivoraX editor), edit, and delete actions. Templates are edited with
 * the same editor as pages; only the editing context differs (task 002).
 */
final class TemplatesScreen {

	public const CREATE_NONCE = 'nivorax_create_template';
	public const DELETE_NONCE = 'nivorax_delete_template';

	/** Hooks the create/delete POST handlers early so they can redirect. */
	public static function register(): void {
		add_action( 'admin_init', [ self::class, 'maybe_handle_actions' ] );
	}

	/** Processes create/delete submissions before any output. */
	public static function maybe_handle_actions(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST['nivorax_create_template'] ) ) {
			self::handle_create();
		}
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST['nivorax_delete_template'] ) ) {
			self::handle_delete();
		}
	}

	/** Renders the template list grouped by type plus the create form. */
	public static function render(): void {
		if ( ! Capabilities::current_user_can_edit() ) {
			wp_die( esc_html__( 'You do not have permission to manage NivoraX templates.', 'nivorax' ) );
		}

		?>
		<div class="wrap">
			<h1 class="wp-heading-inline"><?php esc_html_e( 'Templates', 'nivorax' ); ?></h1>
			<hr class="wp-header-end">

			<?php self::render_notice(); ?>

			<h2><?php esc_html_e( 'Add new template', 'nivorax' ); ?></h2>
			<form method="post" class="nivorax-template-create">
				<?php wp_nonce_field( self::CREATE_NONCE ); ?>
				<table class="form-table">
					<tr>
						<th><label for="nivorax_template_title"><?php esc_html_e( 'Name', 'nivorax' ); ?></label></th>
						<td>
							<input type="text" id="nivorax_template_title" name="nivorax_template_title"
									class="regular-text" placeholder="<?php esc_attr_e( 'e.g. Site Header', 'nivorax' ); ?>">
						</td>
					</tr>
					<tr>
						<th><label for="nivorax_template_type"><?php esc_html_e( 'Type', 'nivorax' ); ?></label></th>
						<td>
							<select id="nivorax_template_type" name="nivorax_template_type">
								<?php foreach ( self::type_labels() as $type => $label ) : ?>
									<option value="<?php echo esc_attr( $type ); ?>"><?php echo esc_html( $label ); ?></option>
								<?php endforeach; ?>
							</select>
						</td>
					</tr>
				</table>
				<?php submit_button( __( 'Create & open in NivoraX', 'nivorax' ), 'primary', 'nivorax_create_template' ); ?>
			</form>

			<?php self::render_groups(); ?>
		</div>
		<?php
	}

	/** Outputs each template type as a grouped table of templates. */
	private static function render_groups(): void {
		$templates = self::all_templates();

		foreach ( self::type_labels() as $type => $label ) {
			$group = array_filter( $templates, static fn( \WP_Post $p ): bool => TemplateModel::get_type( $p->ID ) === $type );

			echo '<h2>' . esc_html( $label ) . '</h2>';

			if ( empty( $group ) ) {
				echo '<p>' . esc_html__( 'No templates of this type yet.', 'nivorax' ) . '</p>';
				continue;
			}

			echo '<table class="wp-list-table widefat fixed striped">';
			echo '<thead><tr>';
			echo '<th>' . esc_html__( 'Name', 'nivorax' ) . '</th>';
			echo '<th>' . esc_html__( 'Status', 'nivorax' ) . '</th>';
			echo '<th>' . esc_html__( 'Actions', 'nivorax' ) . '</th>';
			echo '</tr></thead><tbody>';

			foreach ( $group as $template ) {
				$edit_url = EditorScreen::url( $template->ID );
				echo '<tr>';
				echo '<td><a href="' . esc_url( $edit_url ) . '">' . esc_html( get_the_title( $template ) ) . '</a></td>';
				echo '<td>' . esc_html( ucfirst( (string) get_post_status( $template ) ) ) . '</td>';
				echo '<td>';
				echo '<a href="' . esc_url( $edit_url ) . '" class="button button-small">' . esc_html__( 'Edit', 'nivorax' ) . '</a> ';
				self::render_delete_button( $template->ID );
				echo '</td>';
				echo '</tr>';
			}

			echo '</tbody></table>';
		}
	}

	/**
	 * Inline delete form (a button posting back to this screen).
	 *
	 * @param int $template_id Template post ID.
	 */
	private static function render_delete_button( int $template_id ): void {
		?>
		<form method="post" style="display:inline"
				onsubmit="return confirm('<?php echo esc_js( __( 'Delete this template?', 'nivorax' ) ); ?>');">
			<?php wp_nonce_field( self::DELETE_NONCE ); ?>
			<input type="hidden" name="template_id" value="<?php echo esc_attr( (string) $template_id ); ?>">
			<button type="submit" name="nivorax_delete_template" class="button button-small button-link-delete">
				<?php esc_html_e( 'Delete', 'nivorax' ); ?>
			</button>
		</form>
		<?php
	}

	/** Shows a success notice after a delete. */
	private static function render_notice(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( isset( $_GET['nivorax_deleted'] ) && '1' === $_GET['nivorax_deleted'] ) {
			echo '<div class="notice notice-success is-dismissible"><p>'
				. esc_html__( 'Template deleted.', 'nivorax' ) . '</p></div>';
		}
	}

	/** Creates a template post of the chosen type and opens the editor. */
	private static function handle_create(): void {
		if ( ! Capabilities::current_user_can_edit() ) {
			wp_die( esc_html__( 'You do not have permission to create templates.', 'nivorax' ) );
		}
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$nonce = isset( $_POST['_wpnonce'] ) ? sanitize_text_field( wp_unslash( (string) $_POST['_wpnonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, self::CREATE_NONCE ) ) {
			wp_die( esc_html__( 'Security check failed.', 'nivorax' ) );
		}

		$type = isset( $_POST['nivorax_template_type'] )
			? sanitize_key( wp_unslash( (string) $_POST['nivorax_template_type'] ) )
			: '';
		if ( ! TemplateModel::is_valid_type( $type ) ) {
			wp_die( esc_html__( 'Invalid template type.', 'nivorax' ) );
		}

		$title   = isset( $_POST['nivorax_template_title'] )
			? sanitize_text_field( wp_unslash( (string) $_POST['nivorax_template_title'] ) )
			: '';
		$post_id = wp_insert_post(
			[
				'post_title'  => '' !== $title ? $title : self::default_title( $type ),
				'post_type'   => TemplatePostType::POST_TYPE,
				'post_status' => 'publish',
			],
			true
		);

		if ( is_wp_error( $post_id ) ) {
			wp_die( esc_html( $post_id->get_error_message() ) );
		}

		TemplateModel::set_type( $post_id, $type );
		EditorMode::set_nivorax( $post_id );

		wp_safe_redirect( EditorScreen::url( $post_id ) );
		exit;
	}

	/** Deletes a template post and redirects back with a notice. */
	private static function handle_delete(): void {
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$nonce = isset( $_POST['_wpnonce'] ) ? sanitize_text_field( wp_unslash( (string) $_POST['_wpnonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, self::DELETE_NONCE ) ) {
			wp_die( esc_html__( 'Security check failed.', 'nivorax' ) );
		}

		$template_id = isset( $_POST['template_id'] ) ? (int) $_POST['template_id'] : 0;
		if ( $template_id <= 0 || ! Capabilities::user_can_edit_post( $template_id ) ) {
			wp_die( esc_html__( 'You do not have permission to delete this template.', 'nivorax' ) );
		}
		if ( TemplatePostType::POST_TYPE !== get_post_type( $template_id ) ) {
			wp_die( esc_html__( 'Not a NivoraX template.', 'nivorax' ) );
		}

		wp_delete_post( $template_id, true );

		wp_safe_redirect(
			add_query_arg(
				[
					'page'            => \NivoraX\Admin\Menu::SLUG_TEMPLATES,
					'nivorax_deleted' => '1',
				],
				admin_url( 'admin.php' )
			)
		);
		exit;
	}

	/**
	 * All template posts, newest first.
	 *
	 * @return list<\WP_Post>
	 */
	private static function all_templates(): array {
		$posts = get_posts(
			[
				'post_type'      => TemplatePostType::POST_TYPE,
				'post_status'    => [ 'publish', 'draft' ],
				'posts_per_page' => 100,
				'orderby'        => 'date',
				'order'          => 'DESC',
			]
		);

		return array_values( array_filter( $posts, static fn( $p ): bool => $p instanceof \WP_Post ) );
	}

	/**
	 * Human labels for each template type, in display order.
	 *
	 * @return array<string, string>
	 */
	private static function type_labels(): array {
		return [
			TemplateModel::TYPE_HEADER  => __( 'Header', 'nivorax' ),
			TemplateModel::TYPE_FOOTER  => __( 'Footer', 'nivorax' ),
			TemplateModel::TYPE_SINGLE  => __( 'Single', 'nivorax' ),
			TemplateModel::TYPE_ARCHIVE => __( 'Archive', 'nivorax' ),
			TemplateModel::TYPE_404     => __( '404', 'nivorax' ),
			TemplateModel::TYPE_SEARCH  => __( 'Search', 'nivorax' ),
		];
	}

	/**
	 * Fallback title when the user leaves the name blank.
	 *
	 * @param string $type Template type.
	 */
	private static function default_title( string $type ): string {
		$labels = self::type_labels();
		$label  = $labels[ $type ] ?? __( 'Template', 'nivorax' );
		/* translators: %s: template type label. */
		return sprintf( __( 'Untitled %s', 'nivorax' ), $label );
	}
}
