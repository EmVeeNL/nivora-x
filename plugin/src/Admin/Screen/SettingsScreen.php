<?php

declare( strict_types=1 );

namespace NivoraX\Admin\Screen;

defined( 'ABSPATH' ) || exit;

/**
 * Settings screen container — delegates to SettingsPage.
 */
final class SettingsScreen {

	/** Renders the settings form. */
	public static function render(): void {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'NivoraX Settings', 'nivorax' ); ?></h1>
			<form method="post" action="options.php">
				<?php
				settings_fields( \NivoraX\Admin\Settings\SettingsPage::OPTION_GROUP );
				do_settings_sections( \NivoraX\Admin\Settings\SettingsPage::PAGE_SLUG );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}
}
