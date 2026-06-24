<?php
/**
 * Route all outbound mail to Mailhog for local development.
 *
 * Dropped in wp-content/mu-plugins so it loads automatically — no activation needed.
 */

add_action( 'phpmailer_init', static function ( PHPMailer\PHPMailer\PHPMailer $phpmailer ): void {
	$phpmailer->isSMTP();
	$phpmailer->Host       = 'mailhog';
	$phpmailer->Port       = 1025;
	$phpmailer->SMTPAuth   = false;
	$phpmailer->SMTPSecure = '';
} );
