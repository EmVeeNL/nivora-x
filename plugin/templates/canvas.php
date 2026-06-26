<?php
/**
 * NivoraX front-end canvas template.
 *
 * Loaded via `template_include` when a NivoraX content template wins resolution.
 * Outputs a full HTML document (so the theme's header/footer are bypassed —
 * NivoraX supplies its own) with `wp_head()`/`wp_footer()` so scripts, styles,
 * and the admin bar still work. The composed markup is pre-rendered and escaped
 * by {@see \NivoraX\Templates\TemplateHierarchy}.
 *
 * @package NivoraX
 */

declare( strict_types=1 );

use NivoraX\Templates\TemplateHierarchy;

defined( 'ABSPATH' ) || exit;

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'nivorax-template-body' ); ?>>
<?php wp_body_open(); ?>
<?php
// Composed HTML is already escaped by the per-element renderers (Phase 10).
echo TemplateHierarchy::composed_html(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
?>
<?php wp_footer(); ?>
</body>
</html>
