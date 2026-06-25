<?php

declare( strict_types=1 );

namespace NivoraX\Storage;

defined( 'ABSPATH' ) || exit;

/**
 * Value object representing the versioned NivoraX document envelope.
 *
 * The `tree` payload is intentionally opaque in Phase 02 — Phase 04 gives it
 * a typed node-schema and a validator.
 *
 * @phpstan-type EnvelopeArray array{version: int, tree: mixed, meta: array<string, mixed>}
 */
final class Envelope {

	public const CURRENT_VERSION = 1;

	/**
	 * Creates an envelope instance.
	 *
	 * @param int                  $version Envelope schema version.
	 * @param mixed                $tree    Node tree payload.
	 * @param array<string, mixed> $meta    Document metadata.
	 */
	public function __construct(
		public readonly int $version,
		public readonly mixed $tree,
		public readonly array $meta = [],
	) {}

	/** Well-formed empty default returned when no data exists yet. */
	public static function empty(): self {
		return new self( self::CURRENT_VERSION, null );
	}

	/**
	 * Deserialise from the raw JSON string stored in post meta.
	 *
	 * Returns the empty default on any parse / structural failure (fail-safe).
	 * Uses non-associative decode so empty JSON objects ({}) remain as stdClass
	 * instances and round-trip back to {} rather than collapsing to PHP [] which
	 * json_encode would emit as a JSON array.
	 *
	 * @param string $json Serialised envelope JSON.
	 */
	public static function from_json( string $json ): self {
		if ( '' === $json ) {
			return self::empty();
		}

		$data = json_decode( $json );

		if ( ! is_object( $data ) ) {
			return self::empty();
		}

		return new self(
			version: isset( $data->version ) && is_int( $data->version ) ? $data->version : self::CURRENT_VERSION,
			tree:    $data->tree ?? null,
			meta:    isset( $data->meta ) && is_object( $data->meta ) ? (array) $data->meta : [],
		);
	}

	/**
	 * Serialise to a JSON string for storage in post meta.
	 *
	 * @throws \RuntimeException If JSON encoding fails.
	 */
	public function to_json(): string {
		$encoded = wp_json_encode(
			[
				'version' => $this->version,
				'tree'    => $this->tree,
				'meta'    => $this->meta,
			]
		);

		if ( false === $encoded ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- exception message, not rendered output
			throw new \RuntimeException( 'Failed to serialize document: ' . json_last_error_msg() );
		}

		return $encoded;
	}
}
