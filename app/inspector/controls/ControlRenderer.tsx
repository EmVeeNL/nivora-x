import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { InspectorSection } from '@/shell/InspectorSection'
import { useDocumentStore } from '@/document/store'
import { useUiStore, type Breakpoint } from '@/state/uiStore'
import type { NxNode } from '@/document/schema/types'
import { loadWordPressFontOptions } from '@/inspector/style/fontFamilies'
import { ResponsiveControlAdornment } from './ResponsiveControlAdornment'
import {
  getInheritedResponsiveValue,
  hasResponsiveOverride,
  resolveResponsiveValue,
} from '@/breakpoints/resolveResponsive'
import { isDesktopBreakpoint, type BreakpointConfig } from '@/breakpoints/config'
import {
  CSS_UNITS,
  type ControlDefinition,
  type ControlSectionSchema,
  type CssUnit,
  type KnownControl,
  type ShadowValue,
  type SpacingValue,
  type UnitValue,
} from './types'
import { normalizeSpacingValue, normalizeUnitValue, spacingValue, unitValue } from './valueUnits'

interface ControlRendererProps {
  node: NxNode
  sections: ControlSectionSchema[]
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readProp<T>(
  node: NxNode,
  control: ControlDefinition,
  fallback: T,
  breakpoints: BreakpointConfig[],
  breakpoint: Breakpoint = 'desktop',
): T {
  const raw = node.props[control.prop]

  if (control.valueScope !== 'style') {
    return (raw as T | undefined) ?? fallback
  }

  if (!raw || typeof raw !== 'object' || !('base' in raw)) {
    return (raw as T | undefined) ?? fallback
  }

  return resolveResponsiveValue(raw, breakpoint, breakpoints, fallback)
}

function isBreakpointLocked(
  node: NxNode,
  control: ControlDefinition,
  breakpoint: Breakpoint,
): boolean {
  if (isDesktopBreakpoint(breakpoint) || control.valueScope !== 'style') return false
  const raw = node.props[control.prop]
  return !hasResponsiveOverride(raw, breakpoint)
}

function updateNode(
  node: NxNode,
  control: ControlDefinition,
  value: unknown,
  breakpoint: Breakpoint = 'desktop',
) {
  let nextValue: unknown

  if (control.valueScope === 'style') {
    const existing = node.props[control.prop]
    const existingObj =
      existing && typeof existing === 'object' && 'base' in existing
        ? { ...(existing as Record<string, unknown>) }
        : { base: existing }

    nextValue =
      breakpoint === 'desktop'
        ? { ...existingObj, base: value }
        : { ...existingObj, [breakpoint]: value }
  } else {
    nextValue = value
  }

  useDocumentStore
    .getState()
    .updateProps(
      node.id,
      { [control.prop]: nextValue },
      undefined,
      control.coalesce ? control.id : undefined,
    )
}

function toggleBreakpointLock(node: NxNode, control: ControlDefinition, breakpoint: Breakpoint) {
  if (isDesktopBreakpoint(breakpoint)) return
  const raw = node.props[control.prop]
  const breakpoints = useUiStore.getState().breakpoints
  const locked = isBreakpointLocked(node, control, breakpoint)

  if (locked) {
    // Unlock: copy the currently inherited value to the active breakpoint
    const inherited = getInheritedResponsiveValue(raw, breakpoint, breakpoints, undefined)
    const existingObj =
      raw && typeof raw === 'object' && 'base' in raw
        ? { ...(raw as Record<string, unknown>) }
        : { base: raw }
    useDocumentStore.getState().updateProps(node.id, {
      [control.prop]: { ...existingObj, [breakpoint]: inherited },
    })
  } else {
    // Lock: remove the breakpoint override
    const next = { ...(raw as Record<string, unknown>) }
    delete next[breakpoint]
    useDocumentStore.getState().updateProps(node.id, { [control.prop]: next })
  }
}

// ---------------------------------------------------------------------------
// Input styling (dark Webflow-style)
// ---------------------------------------------------------------------------

const INPUT_STYLE: React.CSSProperties = {
  height: 24,
  background: '#252525',
  border: '1px solid #333',
  borderRadius: 3,
  color: '#ffffff',
  fontSize: 11,
  padding: '0 6px',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
}

const SELECT_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  cursor: 'pointer',
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
  paddingRight: 20,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23666'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 6px center',
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  color: '#888888',
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  flexShrink: 0,
  width: 72,
}

// ---------------------------------------------------------------------------
// Layout primitives
// ---------------------------------------------------------------------------

/** Inline row: 72px label on the left, control on the right. */
function FieldRow({
  control,
  children,
}: {
  control: ControlDefinition
  children: React.ReactNode
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minHeight: 28,
        paddingTop: 2,
        paddingBottom: 2,
      }}
    >
      <span style={LABEL_STYLE}>{control.label}</span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </label>
  )
}

/** Block layout: label above, control below. For multi-line controls. */
function FieldBlock({
  control,
  children,
}: {
  control: ControlDefinition
  children: React.ReactNode
}) {
  return (
    <div style={{ paddingTop: 4, paddingBottom: 4 }}>
      <span style={{ ...LABEL_STYLE, display: 'block', marginBottom: 4, width: 'auto' }}>
        {control.label}
      </span>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Responsive lock button
// ---------------------------------------------------------------------------

function ResponsiveAdornment({
  node,
  control,
  breakpoint,
}: {
  node: NxNode
  control: ControlDefinition
  breakpoint: Breakpoint
}) {
  if (isDesktopBreakpoint(breakpoint) || control.valueScope !== 'style') return null
  const inherited = isBreakpointLocked(node, control, breakpoint)

  return (
    <ResponsiveControlAdornment
      breakpoint={breakpoint}
      state={inherited ? 'inherited' : 'overridden'}
      onCreateOverride={() => toggleBreakpointLock(node, control, breakpoint)}
      onReset={() => toggleBreakpointLock(node, control, breakpoint)}
    />
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function UnitInput({
  value,
  units = [...CSS_UNITS],
  disabled,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: UnitValue
  units?: CssUnit[]
  disabled?: boolean
  min?: number
  max?: number
  step?: number
  onChange(this: void, value: UnitValue): void
}) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      <input
        type="number"
        value={value.value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        style={{ ...INPUT_STYLE, flex: 1, minWidth: 0 }}
        onChange={(e) => onChange({ ...value, value: Number(e.target.value) })}
      />
      <select
        value={value.unit}
        disabled={disabled}
        style={{ ...SELECT_STYLE, width: 44, flexShrink: 0, padding: '0 4px' }}
        onChange={(e) => onChange({ ...value, unit: e.target.value as CssUnit })}
      >
        {units.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>
    </div>
  )
}

function unitInputProps(control: { units?: CssUnit[]; min?: number; max?: number; step?: number }) {
  return {
    ...(control.units ? { units: control.units } : {}),
    ...(control.min !== undefined ? { min: control.min } : {}),
    ...(control.max !== undefined ? { max: control.max } : {}),
    ...(control.step !== undefined ? { step: control.step } : {}),
  }
}

function mergeOptions(options: Array<{ label: string; value: string }>) {
  const seen = new Set<string>()
  return options.filter((opt) => {
    if (seen.has(opt.value)) return false
    seen.add(opt.value)
    return true
  })
}

function SelectInput({
  node,
  control,
  value,
  disabled,
  breakpoint,
}: {
  node: NxNode
  control: KnownControl & { type: 'select' }
  value: string
  disabled: boolean
  breakpoint: Breakpoint
}) {
  const [options, setOptions] = useState(control.options)

  useEffect(() => {
    let cancelled = false
    if (control.prop !== 'fontFamily') return
    void loadWordPressFontOptions().then((fontOptions) => {
      if (!cancelled && fontOptions.length > 0) {
        setOptions(mergeOptions([...fontOptions, ...control.options]))
      }
    })
    return () => {
      cancelled = true
    }
  }, [control.options, control.prop])

  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        disabled={disabled}
        style={SELECT_STYLE}
        onChange={(e) => updateNode(node, control, e.target.value, breakpoint)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SpacingWidget — redesigned with Y/X/All link buttons
// ---------------------------------------------------------------------------

function LinkButton({
  active,
  title,
  onClick,
  children,
  round,
}: {
  active: boolean
  title: string
  onClick: () => void
  children: React.ReactNode
  round?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: round ? 18 : 16,
        height: round ? 18 : 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? 'rgba(74,158,255,0.15)' : 'transparent',
        border: `1px solid ${active ? '#4a9eff' : '#3a3a3a'}`,
        borderRadius: round ? '50%' : 3,
        color: active ? '#4a9eff' : '#555',
        cursor: 'pointer',
        fontSize: 9,
        padding: 0,
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  )
}

function SpacingWidget({
  value,
  disabled,
  onChange,
}: {
  value: SpacingValue
  disabled?: boolean
  onChange(this: void, value: SpacingValue): void
}) {
  const [yLinked, setYLinked] = useState(false)
  const [xLinked, setXLinked] = useState(false)
  const [allLinked, setAllLinked] = useState(false)

  const effY = allLinked || yLinked
  const effX = allLinked || xLinked

  function changeTop(v: UnitValue) {
    if (allLinked) onChange({ top: v, right: v, bottom: v, left: v })
    else if (yLinked) onChange({ ...value, top: v, bottom: v })
    else onChange({ ...value, top: v })
  }
  function changeBottom(v: UnitValue) {
    if (allLinked) onChange({ top: v, right: v, bottom: v, left: v })
    else if (yLinked) onChange({ ...value, top: v, bottom: v })
    else onChange({ ...value, bottom: v })
  }
  function changeLeft(v: UnitValue) {
    if (allLinked) onChange({ top: v, right: v, bottom: v, left: v })
    else if (xLinked) onChange({ ...value, left: v, right: v })
    else onChange({ ...value, left: v })
  }
  function changeRight(v: UnitValue) {
    if (allLinked) onChange({ top: v, right: v, bottom: v, left: v })
    else if (xLinked) onChange({ ...value, left: v, right: v })
    else onChange({ ...value, right: v })
  }

  function toggleY() {
    if (allLinked) {
      setAllLinked(false)
      setYLinked(true)
    } else setYLinked((v) => !v)
  }
  function toggleX() {
    if (allLinked) {
      setAllLinked(false)
      setXLinked(true)
    } else setXLinked((v) => !v)
  }
  function toggleAll() {
    setAllLinked((v) => {
      if (!v) {
        setYLinked(false)
        setXLinked(false)
      }
      return !v
    })
  }

  const sideLabel = (l: string) => (
    <span style={{ ...LABEL_STYLE, width: 10, fontSize: 9, color: '#555', textAlign: 'center' }}>
      {l}
    </span>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Row 1: T [input] [Y-link] [input] B */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {sideLabel('T')}
        <div style={{ flex: 1, minWidth: 0 }}>
          <UnitInput value={value.top} disabled={disabled ?? false} onChange={changeTop} />
        </div>
        <LinkButton active={effY} title="Link top ↔ bottom" onClick={toggleY}>
          <Icon icon="tabler:arrows-vertical" width={9} height={9} />
        </LinkButton>
        <div style={{ flex: 1, minWidth: 0 }}>
          <UnitInput value={value.bottom} disabled={disabled ?? false} onChange={changeBottom} />
        </div>
        {sideLabel('B')}
      </div>

      {/* Row 2: L [input] [X-link] [input] R */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {sideLabel('L')}
        <div style={{ flex: 1, minWidth: 0 }}>
          <UnitInput value={value.left} disabled={disabled ?? false} onChange={changeLeft} />
        </div>
        <LinkButton active={effX} title="Link left ↔ right" onClick={toggleX}>
          <Icon icon="tabler:arrows-horizontal" width={9} height={9} />
        </LinkButton>
        <div style={{ flex: 1, minWidth: 0 }}>
          <UnitInput value={value.right} disabled={disabled ?? false} onChange={changeRight} />
        </div>
        {sideLabel('R')}
      </div>

      {/* Center all-link */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <LinkButton active={allLinked} title="Link all sides" onClick={toggleAll} round>
          <Icon icon="tabler:arrows-maximize" width={9} height={9} />
        </LinkButton>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ShadowInput — sub-fields composing a CSS box-shadow
// ---------------------------------------------------------------------------

const DEFAULT_SHADOW: ShadowValue = {
  offsetX: unitValue(0),
  offsetY: unitValue(4),
  blur: unitValue(12),
  spread: unitValue(0),
  color: 'rgba(0,0,0,0.2)',
  inset: false,
}

function normalizeShadow(v: unknown): ShadowValue {
  if (v && typeof v === 'object' && 'offsetX' in v) return v as ShadowValue
  return DEFAULT_SHADOW
}

function ShadowInput({
  value: rawValue,
  disabled,
  onChange,
}: {
  value: unknown
  disabled?: boolean
  onChange(this: void, value: ShadowValue): void
}) {
  const value = normalizeShadow(rawValue)

  const row = (label: string, content: React.ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 24 }}>
      <span style={{ ...LABEL_STYLE, width: 52 }}>{label}</span>
      <div style={{ flex: 1, minWidth: 0 }}>{content}</div>
    </div>
  )

  const dis = disabled ?? false
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {row(
        'Offset X',
        <UnitInput
          value={value.offsetX}
          disabled={dis}
          onChange={(v) => onChange({ ...value, offsetX: v })}
        />,
      )}
      {row(
        'Offset Y',
        <UnitInput
          value={value.offsetY}
          disabled={dis}
          onChange={(v) => onChange({ ...value, offsetY: v })}
        />,
      )}
      {row(
        'Blur',
        <UnitInput
          value={value.blur}
          disabled={dis}
          min={0}
          onChange={(v) => onChange({ ...value, blur: v })}
        />,
      )}
      {row(
        'Spread',
        <UnitInput
          value={value.spread}
          disabled={dis}
          onChange={(v) => onChange({ ...value, spread: v })}
        />,
      )}
      {row(
        'Color',
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            type="color"
            value={value.color.startsWith('rgba') ? '#000000' : value.color}
            disabled={dis}
            style={{
              width: 24,
              height: 24,
              padding: 2,
              border: '1px solid #333',
              borderRadius: 3,
              background: '#252525',
              cursor: dis ? 'not-allowed' : 'pointer',
            }}
            onChange={(e) => onChange({ ...value, color: e.target.value })}
          />
          <input
            value={value.color}
            placeholder="rgba(0,0,0,0.2)"
            disabled={dis}
            style={{ ...INPUT_STYLE, flex: 1 }}
            onChange={(e) => onChange({ ...value, color: e.target.value })}
          />
        </div>,
      )}
      {row(
        'Inset',
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={value.inset}
            disabled={dis}
            style={{ accentColor: '#4a9eff' }}
            onChange={(e) => onChange({ ...value, inset: e.target.checked })}
          />
          <span style={{ fontSize: 11, color: '#888' }}>Inset shadow</span>
        </label>,
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Control rendering
// ---------------------------------------------------------------------------

function renderControl(
  node: NxNode,
  control: ControlDefinition,
  disabled: boolean,
  breakpoints: BreakpointConfig[],
  breakpoint: Breakpoint,
) {
  const locked = isBreakpointLocked(node, control, breakpoint)
  const dis = disabled || control.disabled === true || locked

  switch (control.type) {
    case 'text': {
      const c = control as KnownControl & { type: 'text' }
      const value = readProp(node, c, c.defaultValue ?? '', breakpoints, breakpoint)
      return (
        <FieldRow control={control}>
          <input
            value={value}
            placeholder={c.placeholder}
            disabled={dis}
            style={INPUT_STYLE}
            onChange={(e) => updateNode(node, c, e.target.value, breakpoint)}
          />
        </FieldRow>
      )
    }

    case 'textarea': {
      const c = control as KnownControl & { type: 'textarea' }
      const value = readProp(node, c, c.defaultValue ?? '', breakpoints, breakpoint)
      return (
        <FieldBlock control={control}>
          <textarea
            value={value}
            placeholder={c.placeholder}
            disabled={dis}
            style={{ ...INPUT_STYLE, height: 64, padding: '4px 6px', resize: 'vertical' }}
            onChange={(e) => updateNode(node, c, e.target.value, breakpoint)}
          />
        </FieldBlock>
      )
    }

    case 'number': {
      const c = control as KnownControl & { type: 'number' }
      const value = readProp(node, c, c.defaultValue ?? 0, breakpoints, breakpoint)
      return (
        <FieldRow control={control}>
          <input
            type="number"
            value={value}
            min={c.min}
            max={c.max}
            step={c.step ?? 1}
            disabled={dis}
            style={INPUT_STYLE}
            onChange={(e) => updateNode(node, c, Number(e.target.value), breakpoint)}
          />
        </FieldRow>
      )
    }

    case 'slider': {
      const c = control as KnownControl & { type: 'slider' }
      const value = readProp(node, c, c.defaultValue ?? c.min, breakpoints, breakpoint)
      return (
        <FieldRow control={control}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="range"
              value={value}
              min={c.min}
              max={c.max}
              step={c.step ?? 1}
              disabled={dis}
              style={{ flex: 1, minWidth: 0, accentColor: '#4a9eff' }}
              onChange={(e) => updateNode(node, c, Number(e.target.value), breakpoint)}
            />
            <span
              style={{ width: 28, textAlign: 'right', fontSize: 11, color: '#888', flexShrink: 0 }}
            >
              {value}
            </span>
          </div>
        </FieldRow>
      )
    }

    case 'select': {
      const c = control as KnownControl & { type: 'select' }
      const value = readProp(
        node,
        c,
        c.defaultValue ?? c.options[0]?.value ?? '',
        breakpoints,
        breakpoint,
      )
      return (
        <FieldRow control={control}>
          <SelectInput
            node={node}
            control={c}
            value={value}
            disabled={dis}
            breakpoint={breakpoint}
          />
        </FieldRow>
      )
    }

    case 'toggle': {
      const c = control as KnownControl & { type: 'toggle' }
      const value = readProp(node, c, c.defaultValue ?? false, breakpoints, breakpoint)
      return (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 28,
            cursor: 'pointer',
          }}
        >
          <span style={LABEL_STYLE}>{control.label}</span>
          <input
            type="checkbox"
            checked={value}
            disabled={dis}
            style={{ accentColor: '#4a9eff', width: 14, height: 14 }}
            onChange={(e) => updateNode(node, c, e.target.checked, breakpoint)}
          />
        </label>
      )
    }

    case 'color': {
      const c = control as KnownControl & { type: 'color' }
      const value = readProp(node, c, c.defaultValue ?? '', breakpoints, breakpoint)
      const pickerValue = value !== '' ? value : '#ffffff'
      return (
        <FieldRow control={control}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 24, height: 24, flexShrink: 0 }}>
              {value === '' && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 2,
                    borderRadius: 2,
                    background:
                      'linear-gradient(to bottom right, transparent calc(50% - 1px), #f87171 calc(50% - 1px), #f87171 calc(50% + 1px), transparent calc(50% + 1px))',
                    pointerEvents: 'none',
                  }}
                />
              )}
              <input
                type="color"
                value={pickerValue}
                disabled={dis}
                style={{
                  width: 24,
                  height: 24,
                  padding: 2,
                  border: '1px solid #333',
                  borderRadius: 3,
                  background: '#252525',
                  cursor: dis ? 'not-allowed' : 'pointer',
                  opacity: dis ? 0.5 : 1,
                }}
                onChange={(e) => updateNode(node, c, e.target.value, breakpoint)}
              />
            </div>
            <input
              value={value}
              placeholder="—"
              disabled={dis}
              style={{ ...INPUT_STYLE, flex: 1, minWidth: 0 }}
              onChange={(e) => updateNode(node, c, e.target.value, breakpoint)}
            />
            {value !== '' && (
              <button
                type="button"
                title="Clear"
                disabled={dis}
                style={{
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: '1px solid #333',
                  borderRadius: 3,
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: 13,
                  flexShrink: 0,
                  padding: 0,
                }}
                onClick={() => updateNode(node, c, '', breakpoint)}
              >
                ×
              </button>
            )}
          </div>
        </FieldRow>
      )
    }

    case 'unit': {
      const c = control as KnownControl & { type: 'unit' }
      const value = normalizeUnitValue(
        readProp(node, c, c.defaultValue, breakpoints, breakpoint),
        c.defaultValue ?? unitValue(),
      )
      return (
        <FieldRow control={control}>
          <UnitInput
            value={value}
            disabled={dis}
            {...unitInputProps(c)}
            onChange={(next) => updateNode(node, c, next, breakpoint)}
          />
        </FieldRow>
      )
    }

    case 'spacing': {
      const c = control as KnownControl & { type: 'spacing' }
      const value = normalizeSpacingValue(
        readProp(node, c, c.defaultValue, breakpoints, breakpoint),
        c.defaultValue ?? spacingValue(),
      )
      return (
        <FieldBlock control={control}>
          <SpacingWidget
            value={value}
            disabled={dis}
            onChange={(next) => updateNode(node, c, next, breakpoint)}
          />
        </FieldBlock>
      )
    }

    case 'shadow': {
      const c = control as KnownControl & { type: 'shadow' }
      const value = readProp(node, c, c.defaultValue, breakpoints, breakpoint)
      return (
        <FieldBlock control={control}>
          <ShadowInput
            value={value}
            disabled={dis}
            onChange={(next) => updateNode(node, c, next, breakpoint)}
          />
        </FieldBlock>
      )
    }

    default:
      console.warn(`Unknown control type "${control.type}" skipped`)
      return null
  }
}

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export function ControlRenderer({ node, sections, disabled = false }: ControlRendererProps) {
  const breakpoint = useUiStore((s) => s.activeBreakpoint)
  const breakpoints = useUiStore((s) => s.breakpoints)

  if (sections.length === 0) {
    return (
      <p style={{ padding: '24px 12px', textAlign: 'center', fontSize: 11, color: '#555' }}>
        No controls available
      </p>
    )
  }

  return (
    <>
      {sections.map((section) => (
        <InspectorSection key={section.id} id={section.id} title={section.title}>
          {section.controls.map((control) => {
            const showResponsiveAdornment =
              !isDesktopBreakpoint(breakpoint) && control.valueScope === 'style'
            return (
              <div
                key={control.id}
                style={{ position: 'relative', paddingRight: showResponsiveAdornment ? 88 : 0 }}
              >
                {renderControl(node, control, disabled, breakpoints, breakpoint)}
                {showResponsiveAdornment && (
                  <ResponsiveAdornment node={node} control={control} breakpoint={breakpoint} />
                )}
              </div>
            )
          })}
        </InspectorSection>
      ))}
    </>
  )
}
