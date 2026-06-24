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
	 *
	 * @param string $json Serialised envelope JSON.
	 */
	public static function from_json( string $json ): self {
		if ( '' === $json ) {
			return self::empty();
		}

		$data = json_decode( $json, true );

		if ( ! is_array( $data ) ) {
			return self::empty();
		}

		return new self(
			version: isset( $data['version'] ) && is_int( $data['version'] ) ? $data['version'] : self::CURRENT_VERSION,
			tree:    $data['tree'] ?? null,
			meta:    isset( $data['meta'] ) && is_array( $data['meta'] ) ? $data['meta'] : [],
		);
	}

	/** Serialise to a JSON string for storage in post meta. */
	public function to_json(): string {
		return (string) wp_json_encode(
			[
				'version' => $this->version,
				'tree'    => $this->tree,
				'meta'    => $this->meta,
			]
		);
	}
}
