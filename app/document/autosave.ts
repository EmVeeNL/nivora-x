import type { DocumentEnvelope } from './schema/types'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface AutosaveOptions {
  /** Debounce delay in milliseconds before triggering a save. */
  debounceMs?: number
  /** Called to perform the actual save. */
  onSave: (envelope: DocumentEnvelope) => Promise<void>
  /** Called whenever the status transitions. */
  onStatus?: (status: SaveStatus) => void
}

/**
 * Creates a debounced autosave controller.
 * Returns a `schedule` function to call after each mutation, and a `cancel`
 * to flush the pending timer (e.g. on editor unmount).
 *
 * A single write-queue ensures manual saves and autosave never race:
 * if a save is already in-flight, the debounced call is dropped silently —
 * the next mutation will schedule another round.
 */
export function createAutosave(options: AutosaveOptions) {
  const { debounceMs = 2000, onSave, onStatus } = options

  let timer: ReturnType<typeof setTimeout> | null = null
  let inFlight = false
  let pendingEnvelope: DocumentEnvelope | null = null

  function setStatus(s: SaveStatus) {
    onStatus?.(s)
  }

  async function flush() {
    const envelope = pendingEnvelope
    pendingEnvelope = null
    if (!envelope || inFlight) return

    inFlight = true
    setStatus('saving')
    try {
      await onSave(envelope)
      setStatus('saved')
    } catch {
      setStatus('error')
    } finally {
      inFlight = false
    }
  }

  function schedule(envelope: DocumentEnvelope) {
    pendingEnvelope = envelope
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      void flush()
    }, debounceMs)
  }

  function cancel() {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    pendingEnvelope = null
  }

  return { schedule, cancel }
}
