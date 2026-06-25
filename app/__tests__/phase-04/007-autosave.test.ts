import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createAutosave } from '@/document/autosave'
import type { DocumentEnvelope } from '@/document/schema/types'

const ENVELOPE: DocumentEnvelope = {
  version: 1,
  tree: {
    rootId: 'nx-root0001',
    nodes: {
      'nx-root0001': {
        id: 'nx-root0001',
        type: 'body',
        props: {},
        children: [],
        overrides: {},
        meta: {},
      },
    },
  },
  meta: {},
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('createAutosave', () => {
  it('does not save immediately after schedule', () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { schedule } = createAutosave({ debounceMs: 500, onSave })
    schedule(ENVELOPE)
    expect(onSave).not.toHaveBeenCalled()
  })

  it('saves after the debounce delay', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { schedule } = createAutosave({ debounceMs: 500, onSave })
    schedule(ENVELOPE)
    await vi.advanceTimersByTimeAsync(600)
    expect(onSave).toHaveBeenCalledWith(ENVELOPE)
  })

  it('debounces rapid calls into a single save', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { schedule } = createAutosave({ debounceMs: 500, onSave })
    schedule(ENVELOPE)
    vi.advanceTimersByTime(200)
    schedule(ENVELOPE)
    vi.advanceTimersByTime(200)
    schedule(ENVELOPE)
    await vi.advanceTimersByTimeAsync(600)
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('does not save when nothing has changed (no schedule called)', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    createAutosave({ debounceMs: 500, onSave })
    await vi.advanceTimersByTimeAsync(1000)
    expect(onSave).not.toHaveBeenCalled()
  })

  it('transitions status: idle → saving → saved', async () => {
    const statuses: string[] = []
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { schedule } = createAutosave({
      debounceMs: 500,
      onSave,
      onStatus: (s) => statuses.push(s),
    })
    schedule(ENVELOPE)
    await vi.advanceTimersByTimeAsync(600)
    expect(statuses).toEqual(['saving', 'saved'])
  })

  it('transitions status to error on save failure', async () => {
    const statuses: string[] = []
    const onSave = vi.fn().mockRejectedValue(new Error('network'))
    const { schedule } = createAutosave({
      debounceMs: 500,
      onSave,
      onStatus: (s) => statuses.push(s),
    })
    schedule(ENVELOPE)
    await vi.advanceTimersByTimeAsync(600)
    expect(statuses).toContain('error')
  })

  it('does not race when a save is already in-flight', async () => {
    let saveCalls = 0
    const onSave = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) =>
          setTimeout(() => {
            saveCalls++
            resolve()
          }, 1000),
        ),
    )
    const { schedule } = createAutosave({ debounceMs: 100, onSave })
    schedule(ENVELOPE)
    await vi.advanceTimersByTimeAsync(200) // first save starts
    schedule(ENVELOPE) // schedule another while first is in-flight
    await vi.advanceTimersByTimeAsync(300) // debounce fires but in-flight, dropped
    expect(onSave).toHaveBeenCalledTimes(1) // only one real save call
    await vi.advanceTimersByTimeAsync(1000) // first completes
    expect(saveCalls).toBe(1)
  })

  it('cancel prevents a pending save from firing', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { schedule, cancel } = createAutosave({ debounceMs: 500, onSave })
    schedule(ENVELOPE)
    cancel()
    await vi.advanceTimersByTimeAsync(600)
    expect(onSave).not.toHaveBeenCalled()
  })
})
