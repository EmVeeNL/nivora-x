import type { DocumentEnvelope } from './types'
import { validateEnvelope } from './validate'

export class SerializationError extends Error {
  override readonly name = 'SerializationError'

  constructor(
    message: string,
    public readonly validationErrors: Array<{ field: string; message: string }>,
  ) {
    super(message)
  }
}

/** Serialize a document envelope to a compact JSON string. */
export function serialize(envelope: DocumentEnvelope): string {
  return JSON.stringify(envelope)
}

/**
 * Parse and validate a JSON string into a DocumentEnvelope.
 * Throws SerializationError on parse failure or validation failure.
 * Unknown/extra fields present in the JSON are preserved (pass-through).
 */
export function deserialize(json: string): DocumentEnvelope {
  let parsed: unknown
  try {
    parsed = JSON.parse(json) as unknown
  } catch {
    throw new SerializationError('Invalid JSON', [{ field: '', message: 'JSON.parse failed' }])
  }

  const result = validateEnvelope(parsed)
  if (!result.ok) {
    throw new SerializationError('Document validation failed', result.errors)
  }

  return result.value
}
