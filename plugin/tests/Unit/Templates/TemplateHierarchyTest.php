<?php

declare( strict_types=1 );

use NivoraX\Templates\RequestContext;
use NivoraX\Templates\TemplateHierarchy;

describe(
	'TemplateHierarchy content type resolution',
	function (): void {

		it(
			'maps 404 requests to the 404 template type',
			function (): void {
				$ctx = new RequestContext( is_404: true );
				expect( TemplateHierarchy::content_type_for( $ctx ) )->toBe( '404' );
			}
		);

		it(
			'maps search requests to the search template type',
			function (): void {
				$ctx = new RequestContext( is_search: true );
				expect( TemplateHierarchy::content_type_for( $ctx ) )->toBe( 'search' );
			}
		);

		it(
			'maps singular requests to the single template type',
			function (): void {
				$ctx = new RequestContext( is_singular: true );
				expect( TemplateHierarchy::content_type_for( $ctx ) )->toBe( 'single' );
			}
		);

		it(
			'maps archive requests to the archive template type',
			function (): void {
				$ctx = new RequestContext( is_archive: true );
				expect( TemplateHierarchy::content_type_for( $ctx ) )->toBe( 'archive' );
			}
		);

		it(
			'prioritises 404 and search over singular/archive',
			function (): void {
				$ctx = new RequestContext( is_singular: true, is_404: true );
				expect( TemplateHierarchy::content_type_for( $ctx ) )->toBe( '404' );
			}
		);

		it(
			'returns null for a request that needs no content template',
			function (): void {
				expect( TemplateHierarchy::content_type_for( new RequestContext() ) )->toBeNull();
			}
		);
	}
);

describe(
	'TemplateHierarchy composition',
	function (): void {

		it(
			'wraps content in a main region between header and footer',
			function (): void {
				$html = TemplateHierarchy::compose( '<header>H</header>', '<p>Body</p>', '<footer>F</footer>' );

				expect( $html )->toContain( '<header>H</header>' )
				->and( $html )->toContain( 'nivorax-template-content' )
				->and( $html )->toContain( '<p>Body</p>' )
				->and( $html )->toContain( '<footer>F</footer>' );

				// Header precedes content precedes footer.
				$header_pos  = strpos( $html, '<header>' );
				$content_pos = strpos( $html, '<p>Body' );
				$footer_pos  = strpos( $html, '<footer>' );
				expect( $header_pos )->toBeLessThan( $content_pos )
				->and( $content_pos )->toBeLessThan( $footer_pos );
			}
		);

		it(
			'composes with empty header and footer',
			function (): void {
				$html = TemplateHierarchy::compose( '', '<p>Only body</p>', '' );
				expect( $html )->toContain( '<p>Only body</p>' )
				->and( $html )->toContain( 'nivorax-template-root' );
			}
		);
	}
);
