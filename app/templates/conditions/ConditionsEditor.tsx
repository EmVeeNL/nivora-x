import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { fetchConditions, saveConditions } from '../api'
import {
  CONDITION_OBJECTS,
  CONDITION_OBJECT_LABELS,
  CONDITION_VALUE_HINTS,
  newRule,
  objectTakesValue,
  type ConditionBehavior,
  type ConditionObject,
  type ConditionRule,
} from './types'

/**
 * Display-conditions editor for a single template. Loads the template's
 * include/exclude rules, lets the user add/edit/remove them, and saves back to
 * the REST endpoint that the PHP AssignmentResolver consumes at request time.
 */
export function ConditionsEditor({ templateId }: { templateId: number }) {
  const [rules, setRules] = useState<ConditionRule[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'saving' | 'error'>('loading')

  useEffect(() => {
    let active = true
    setStatus('loading')
    fetchConditions(templateId)
      .then((loaded) => {
        if (active) {
          setRules(loaded)
          setStatus('ready')
        }
      })
      .catch(() => active && setStatus('error'))
    return () => {
      active = false
    }
  }, [templateId])

  const update = (index: number, patch: Partial<ConditionRule>) => {
    setRules((prev) => prev.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)))
  }

  const save = async (next: ConditionRule[]) => {
    setStatus('saving')
    try {
      const normalized = await saveConditions(templateId, next)
      setRules(normalized)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-2" data-testid="conditions-editor">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Display conditions
        </span>
        {status === 'saving' && <span className="text-[10px] text-muted-foreground">saving…</span>}
        {status === 'error' && <span className="text-[10px] text-destructive">error</span>}
      </div>

      {rules.length === 0 && status !== 'loading' && (
        <p className="px-1 text-[11px] text-muted-foreground/60">
          No conditions — this template is not assigned anywhere yet.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        {rules.map((rule, index) => (
          <RuleRow
            key={index}
            rule={rule}
            onChange={(patch) => update(index, patch)}
            onRemove={() => void save(rules.filter((_, i) => i !== index))}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 px-1">
        <button
          type="button"
          data-testid="conditions-add-rule"
          onClick={() => setRules((prev) => [...prev, newRule()])}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <Icon icon="tabler:plus" width={12} height={12} />
          Add condition
        </button>
        <button
          type="button"
          data-testid="conditions-save"
          disabled={status === 'saving'}
          onClick={() => void save(rules)}
          className="ml-auto rounded bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  )
}

function RuleRow({
  rule,
  onChange,
  onRemove,
}: {
  rule: ConditionRule
  onChange: (patch: Partial<ConditionRule>) => void
  onRemove: () => void
}) {
  const selectClass =
    'h-7 rounded border border-border bg-background px-1.5 text-[11px] text-foreground outline-none focus:border-primary'

  return (
    <div className="flex items-center gap-1 px-1">
      <select
        aria-label="Behavior"
        value={rule.behavior}
        onChange={(e) => onChange({ behavior: e.target.value as ConditionBehavior })}
        className={selectClass}
      >
        <option value="include">Include</option>
        <option value="exclude">Exclude</option>
      </select>
      <select
        aria-label="Condition type"
        value={rule.object}
        onChange={(e) => onChange({ object: e.target.value as ConditionObject, value: '' })}
        className={selectClass}
      >
        {CONDITION_OBJECTS.map((object) => (
          <option key={object} value={object}>
            {CONDITION_OBJECT_LABELS[object]}
          </option>
        ))}
      </select>
      {objectTakesValue(rule.object) && (
        <input
          aria-label="Condition value"
          value={rule.value}
          placeholder={CONDITION_VALUE_HINTS[rule.object]}
          onChange={(e) => onChange({ value: e.target.value })}
          className="h-7 min-w-0 flex-1 rounded border border-border bg-background px-1.5 text-[11px] text-foreground outline-none focus:border-primary"
        />
      )}
      <button
        type="button"
        aria-label="Remove condition"
        onClick={onRemove}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-destructive"
      >
        <Icon icon="tabler:x" width={12} height={12} />
      </button>
    </div>
  )
}
