import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { InspectorSection } from '@/shell/InspectorSection'
import { useDocumentStore } from '@/document/store'
import { useUiStore, type Breakpoint } from '@/state/uiStore'
import type { NxNode, StyleState } from '@/document/schema/types'
import { loadWordPressFontOptions } from '@/inspector/style/fontFamilies'
import { ResponsiveControlAdornment } from './ResponsiveControlAdornment'
import {
  getInheritedResponsiveStyleValue,
  getStateValue,
  hasResponsiveStyleOverride,
  isResponsiveObject,
  isStyleStateObject,
  resolveResponsiveStyleValue,
} from '@/breakpoints/resolveResponsive'
import { isDesktopBreakpoint, type BreakpointConfig } from '@/breakpoints/config'
import {
  CSS_UNITS,
  type ColorBoxControl,
  type CornerUnitValue,
  type ControlDefinition,
  type ControlSectionSchema,
  type CssUnit,
  type KnownControl,
  type SelectControl,
  type SideColorValue,
  type SideUnitValue,
  type ShadowValue,
  type SpacingValue,
  type UnitBoxControl,
  type UnitValue,
} from './types'
import {
  cornerUnitValue,
  normalizeCornerUnitValue,
  normalizeSideColorValue,
  normalizeSideUnitValue,
  normalizeSpacingValue,
  normalizeUnitValue,
  sideColorValue,
  sideUnitValue,
  spacingValue,
  unitToCss,
  unitValue,
} from './valueUnits'
import { openWordPressImagePicker } from '@/lib/wordpressMedia'
import { isTokenRef } from '@/tokens/model'
import { TokenOrValue } from './TokenOrValue'
import { Slider } from '@/components/ui/slider'

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
  styleState: StyleState = 'default',
): T {
  const raw = node.props[control.prop]

  if (control.valueScope !== 'style') {
    return (raw as T | undefined) ?? fallback
  }

  return resolveResponsiveStyleValue(raw, styleState, breakpoint, breakpoints, fallback)
}

function isBreakpointLocked(
  node: NxNode,
  control: ControlDefinition,
  breakpoint: Breakpoint,
  styleState: StyleState,
): boolean {
  if (isDesktopBreakpoint(breakpoint) || control.valueScope !== 'style') return false
  const raw = node.props[control.prop]
  return !hasResponsiveStyleOverride(raw, styleState, breakpoint)
}

function toResponsiveDraft(value: unknown, desktopFallback: unknown): Record<string, unknown> {
  if (isResponsiveObject(value)) return { ...value }

  return {
    base: value ?? desktopFallback,
  }
}

function writeStyleValue(
  existing: unknown,
  value: unknown,
  breakpoint: Breakpoint,
  styleState: StyleState,
  breakpoints: BreakpointConfig[],
): unknown {
  if (styleState === 'default' && !isStyleStateObject(existing)) {
    const draft = toResponsiveDraft(existing, existing)
    return breakpoint === 'desktop' ? { ...draft, base: value } : { ...draft, [breakpoint]: value }
  }

  const nextStates = isStyleStateObject(existing)
    ? { ...existing }
    : existing !== undefined
      ? { default: existing }
      : {}
  const stateValue = getStateValue(existing, styleState)
  const desktopFallback = resolveResponsiveStyleValue(
    existing,
    styleState,
    'desktop',
    breakpoints,
    undefined,
  )
  const draft = toResponsiveDraft(stateValue, desktopFallback)

  nextStates[styleState] =
    breakpoint === 'desktop' ? { ...draft, base: value } : { ...draft, [breakpoint]: value }

  return nextStates
}

function updateNode(
  node: NxNode,
  control: ControlDefinition,
  value: unknown,
  breakpoints: BreakpointConfig[],
  breakpoint: Breakpoint = 'desktop',
  styleState: StyleState = 'default',
) {
  let nextValue: unknown

  if (control.valueScope === 'style') {
    nextValue = writeStyleValue(
      node.props[control.prop],
      value,
      breakpoint,
      styleState,
      breakpoints,
    )
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

function toggleBreakpointLock(
  node: NxNode,
  control: ControlDefinition,
  breakpoint: Breakpoint,
  breakpoints: BreakpointConfig[],
  styleState: StyleState,
) {
  if (isDesktopBreakpoint(breakpoint)) return
  const raw = node.props[control.prop]
  const locked = isBreakpointLocked(node, control, breakpoint, styleState)

  if (locked) {
    // Unlock: copy the currently inherited value to the active breakpoint
    const inherited = getInheritedResponsiveStyleValue(
      raw,
      styleState,
      breakpoint,
      breakpoints,
      undefined,
    )
    useDocumentStore.getState().updateProps(node.id, {
      [control.prop]: writeStyleValue(raw, inherited, breakpoint, styleState, breakpoints),
    })
  } else {
    // Lock: remove the breakpoint override
    let next: unknown

    if (styleState === 'default' && !isStyleStateObject(raw)) {
      next = { ...(raw as Record<string, unknown>) }
      delete (next as Record<string, unknown>)[breakpoint]
    } else {
      const nextStates = isStyleStateObject(raw)
        ? { ...raw }
        : raw !== undefined
          ? { default: raw }
          : {}
      const stateValue = getStateValue(raw, styleState)
      const desktopFallback = resolveResponsiveStyleValue(
        raw,
        styleState,
        'desktop',
        breakpoints,
        undefined,
      )
      const draft = toResponsiveDraft(stateValue, desktopFallback)
      delete draft[breakpoint]
      nextStates[styleState] = draft
      next = nextStates
    }

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

const MEDIA_BUTTON_STYLE: React.CSSProperties = {
  ...SELECT_STYLE,
  width: 28,
  flexShrink: 0,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: 'none',
}

const FANCY_PANEL_STYLE: React.CSSProperties = {
  border: '1px solid #383838',
  borderRadius: 8,
  background:
    'linear-gradient(180deg, rgba(48,48,48,0.95) 0%, rgba(34,34,34,0.98) 52%, rgba(28,28,28,1) 100%)',
  padding: 12,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 2px rgba(0,0,0,0.28)',
}

const FANCY_PANEL_LABEL_STYLE: React.CSSProperties = {
  fontSize: 9,
  letterSpacing: '0.1em',
  color: '#7f7f7f',
  textTransform: 'uppercase',
  fontWeight: 700,
}

const BOX_CHIP_STYLE: React.CSSProperties = {
  minWidth: 18,
  height: 18,
  padding: '0 5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
  border: '1px solid #444',
  background: 'linear-gradient(180deg, #343434 0%, #2a2a2a 100%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
  fontSize: 9,
  color: '#c3c3c3',
  fontWeight: 600,
}

const PREVIEW_CARD_STYLE: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid #404040',
  background: 'linear-gradient(180deg, #343434 0%, #2b2b2b 100%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -8px 20px rgba(0,0,0,0.18)',
}

const PREVIEW_GLOW_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at 50% 14%, rgba(74,158,255,0.12), transparent 42%), linear-gradient(135deg, rgba(255,255,255,0.03), transparent 42%)',
}

const VALUE_PILL_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 22,
  height: 14,
  padding: '0 5px',
  borderRadius: 999,
  border: '1px solid rgba(108,171,255,0.18)',
  background: 'rgba(74,158,255,0.1)',
  color: '#b9d6ff',
  fontSize: 8,
  fontWeight: 700,
  letterSpacing: '0.04em',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
}

const ROW_CARD_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '4px 5px',
  borderRadius: 7,
  border: '1px solid rgba(255,255,255,0.03)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.06))',
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

function formatUnitCompact(value: UnitValue): string {
  const rounded = Number.isInteger(value.value) ? `${value.value}` : value.value.toFixed(1)
  return `${rounded}${value.unit}`
}

type BorderSide = keyof SideUnitValue
type BorderCorner = keyof CornerUnitValue

const BORDER_PANEL_STYLE: React.CSSProperties = {
  border: '1px solid #2f2f2f',
  background: 'linear-gradient(180deg, #2a2a2a 0%, #242424 100%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
  borderRadius: 8,
  overflow: 'hidden',
}

const BORDER_SECTION_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 12px',
  borderBottom: '1px solid #373737',
}

const BORDER_LABEL_STYLE: React.CSSProperties = {
  width: 54,
  fontSize: 11,
  color: '#d1d1d1',
  fontWeight: 600,
  flexShrink: 0,
}

const BORDER_NUMBER_STYLE: React.CSSProperties = {
  height: 28,
  background: '#2f2f2f',
  border: '1px solid #222',
  borderRadius: 4,
  color: '#bcbcbc',
  fontSize: 11,
  display: 'flex',
  alignItems: 'center',
  padding: '0 8px',
  gap: 6,
}

const BORDER_VALUE_INPUT_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  width: 44,
  minWidth: 44,
  textAlign: 'right',
  border: 'none',
  background: 'transparent',
  padding: 0,
  height: 'auto',
  appearance: 'textfield',
  WebkitAppearance: 'none',
  MozAppearance: 'textfield',
  color: '#c9c9c9',
  cursor: 'default',
}

const BORDER_ICON_BUTTON_STYLE: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 6,
  border: '1px solid #555',
  background: '#343434',
  display: 'grid',
  placeItems: 'center',
  color: '#ddd',
  flexShrink: 0,
  padding: 0,
  cursor: 'pointer',
}

const BORDER_SIDE_BUTTON_BASE_STYLE: React.CSSProperties = {
  position: 'absolute',
  display: 'grid',
  placeItems: 'center',
  color: '#8f8f8f',
  fontSize: 20,
  lineHeight: 1,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: 0,
}

const BORDER_STYLE_BUTTON_BASE: React.CSSProperties = {
  flex: 1,
  height: 28,
  display: 'grid',
  placeItems: 'center',
  background: '#555',
  border: '1px solid #2a2a2a',
  color: '#bbb',
  fontWeight: 700,
  fontSize: 12,
  cursor: 'pointer',
  padding: 0,
}

const SPACING_PANEL_STYLE: React.CSSProperties = {
  borderRadius: 6,
  background: '#202020',
  border: '1px solid #2f2f2f',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
  padding: 10,
}

const SPACING_SIDE_BUTTON_STYLE: React.CSSProperties = {
  position: 'absolute',
  width: 42,
  height: 28,
  padding: 0,
  borderRadius: 4,
  border: '1px solid #3a3a3a',
  background: '#1c1c1c',
  color: '#d8d8d8',
  fontSize: 12,
  cursor: 'pointer',
}

function sideLabel(side: BorderSide): string {
  return side === 'top' ? 'Top' : side === 'right' ? 'Right' : side === 'bottom' ? 'Bottom' : 'Left'
}

function cornerLabel(corner: BorderCorner): string {
  if (corner === 'topLeft') return 'Top left'
  if (corner === 'topRight') return 'Top right'
  if (corner === 'bottomRight') return 'Bottom right'
  return 'Bottom left'
}

function selectionLabel(values: string[]): string {
  if (values.length === 0) return 'None'
  if (values.length === 1) return values[0] ?? 'None'
  return `${values[0]} +${values.length - 1}`
}

function borderSideEdgeStyle(side: BorderSide, active: boolean): React.CSSProperties {
  const activeColor = '#f0f0f0'
  const idleColor = '#8d8d8d'
  const color = active ? activeColor : idleColor

  if (side === 'top') return { top: 0, left: 2, right: 2, height: 3, background: color }
  if (side === 'bottom') return { bottom: 0, left: 2, right: 2, height: 3, background: color }
  if (side === 'left') return { top: 2, bottom: 2, left: 0, width: 3, background: color }
  return { top: 2, bottom: 2, right: 0, width: 3, background: color }
}

function spacingSidePosition(side: BorderSide): React.CSSProperties {
  if (side === 'top') return { top: 12, left: '50%', transform: 'translateX(-50%)' }
  if (side === 'right') return { right: 12, top: '50%', transform: 'translateY(-50%)' }
  if (side === 'bottom') return { bottom: 12, left: '50%', transform: 'translateX(-50%)' }
  return { left: 12, top: '50%', transform: 'translateY(-50%)' }
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

function MediaPickerButton({
  disabled,
  onSelect,
}: {
  disabled?: boolean
  onSelect(this: void, value: string): void
}) {
  return (
    <button
      type="button"
      title="Choose from WordPress Media Library"
      disabled={disabled}
      style={MEDIA_BUTTON_STYLE}
      onClick={() =>
        openWordPressImagePicker((attachment) => {
          if (attachment.url) onSelect(attachment.url)
        })
      }
    >
      <Icon icon="tabler:photo-search" width={14} height={14} />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Responsive lock button
// ---------------------------------------------------------------------------

function ResponsiveAdornment({
  node,
  control,
  breakpoint,
  breakpoints,
  styleState,
}: {
  node: NxNode
  control: ControlDefinition
  breakpoint: Breakpoint
  breakpoints: BreakpointConfig[]
  styleState: StyleState
}) {
  if (isDesktopBreakpoint(breakpoint) || control.valueScope !== 'style') return null
  const inherited = isBreakpointLocked(node, control, breakpoint, styleState)

  return (
    <ResponsiveControlAdornment
      breakpoint={breakpoint}
      state={inherited ? 'inherited' : 'overridden'}
      onCreateOverride={() =>
        toggleBreakpointLock(node, control, breakpoint, breakpoints, styleState)
      }
      onReset={() => toggleBreakpointLock(node, control, breakpoint, breakpoints, styleState)}
    />
  )
}

function showResponsiveAdornmentFor(control: ControlDefinition, breakpoint: Breakpoint) {
  return !isDesktopBreakpoint(breakpoint) && control.valueScope === 'style'
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
  breakpoints,
  styleState,
}: {
  node: NxNode
  control: KnownControl & { type: 'select' }
  value: string
  disabled: boolean
  breakpoint: Breakpoint
  breakpoints: BreakpointConfig[]
  styleState: StyleState
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
        onChange={(e) =>
          updateNode(node, control, e.target.value, breakpoints, breakpoint, styleState)
        }
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
  title,
  onChange,
}: {
  value: SpacingValue
  disabled?: boolean
  title?: string
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

  const compact = (
    side: 'top' | 'right' | 'bottom' | 'left',
    onValueChange: (v: UnitValue) => void,
  ) => <UnitInput value={value[side]} disabled={disabled ?? false} onChange={onValueChange} />

  return (
    <div style={FANCY_PANEL_STYLE}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span style={FANCY_PANEL_LABEL_STYLE}>{title ?? 'Spacing'}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <LinkButton active={effY} title="Link top ↔ bottom" onClick={toggleY}>
            <Icon icon="tabler:arrows-vertical" width={9} height={9} />
          </LinkButton>
          <LinkButton active={effX} title="Link left ↔ right" onClick={toggleX}>
            <Icon icon="tabler:arrows-horizontal" width={9} height={9} />
          </LinkButton>
          <LinkButton active={allLinked} title="Link all sides" onClick={toggleAll} round>
            <Icon icon="tabler:arrows-maximize" width={9} height={9} />
          </LinkButton>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr minmax(72px, 96px) 1fr',
          gridTemplateRows: 'auto auto auto',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <div />
        <div style={{ minWidth: 0 }}>{compact('top', changeTop)}</div>
        <div />

        <div style={{ minWidth: 0 }}>{compact('left', changeLeft)}</div>
        <div
          style={{
            minHeight: 72,
            ...PREVIEW_CARD_STYLE,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              ...PREVIEW_GLOW_STYLE,
            }}
          />
          <span style={FANCY_PANEL_LABEL_STYLE}>{title ?? 'Spacing'}</span>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 8,
              border: '1px solid #505050',
              background: 'linear-gradient(180deg, #2b2b2b 0%, #242424 100%)',
              position: 'relative',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02), 0 12px 24px rgba(0,0,0,0.16)',
            }}
          >
            <div
              style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)' }}
            >
              <span style={BOX_CHIP_STYLE}>T</span>
            </div>
            <div
              style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)' }}
            >
              <span style={BOX_CHIP_STYLE}>R</span>
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <span style={BOX_CHIP_STYLE}>B</span>
            </div>
            <div
              style={{ position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)' }}
            >
              <span style={BOX_CHIP_STYLE}>L</span>
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 9,
                borderRadius: 6,
                border: '1px solid #6b6b6b',
                background: 'rgba(255,255,255,0.02)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: -22,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <span style={VALUE_PILL_STYLE}>{formatUnitCompact(value.top)}</span>
            </div>
            <div
              style={{
                position: 'absolute',
                right: -26,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <span style={VALUE_PILL_STYLE}>{formatUnitCompact(value.right)}</span>
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: -22,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <span style={VALUE_PILL_STYLE}>{formatUnitCompact(value.bottom)}</span>
            </div>
            <div
              style={{
                position: 'absolute',
                left: -26,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <span style={VALUE_PILL_STYLE}>{formatUnitCompact(value.left)}</span>
            </div>
          </div>
        </div>
        <div style={{ minWidth: 0 }}>{compact('right', changeRight)}</div>

        <div />
        <div style={{ minWidth: 0 }}>{compact('bottom', changeBottom)}</div>
        <div />
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
    <div style={{ ...FANCY_PANEL_STYLE, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={FANCY_PANEL_LABEL_STYLE}>Shadow</span>
        <span style={{ ...BOX_CHIP_STYLE, width: 'auto', padding: '0 8px' }}>
          {value.inset ? 'Inset' : 'Outer'}
        </span>
      </div>
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

function SideUnitWidget({
  value,
  disabled,
  onChange,
}: {
  value: SideUnitValue
  disabled?: boolean
  onChange(this: void, value: SideUnitValue): void
}) {
  const dis = disabled ?? false

  const row = (side: keyof SideUnitValue, label: string, next: (value: UnitValue) => void) => (
    <div key={side} style={ROW_CARD_STYLE}>
      <span style={BOX_CHIP_STYLE}>{label}</span>
      <span style={{ ...FANCY_PANEL_LABEL_STYLE, minWidth: 18, color: '#9a9a9a' }}>
        {label === 'T' ? 'Top' : label === 'R' ? 'Right' : label === 'B' ? 'Bottom' : 'Left'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <UnitInput value={value[side]} disabled={dis} min={0} onChange={next} />
      </div>
    </div>
  )

  return (
    <div
      style={{ ...FANCY_PANEL_STYLE, display: 'grid', gridTemplateColumns: '78px 1fr', gap: 10 }}
    >
      <div
        style={{
          ...PREVIEW_CARD_STYLE,
          minHeight: 104,
          position: 'relative',
        }}
      >
        <div
          style={{
            ...PREVIEW_GLOW_STYLE,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 20,
            right: 20,
            height: 3,
            background: '#8f8f8f',
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 20,
            right: 20,
            height: 3,
            background: '#8f8f8f',
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 20,
            bottom: 20,
            left: 10,
            width: 3,
            background: '#8f8f8f',
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 20,
            bottom: 20,
            right: 10,
            width: 3,
            background: '#8f8f8f',
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 22,
            borderRadius: 6,
            border: '1px solid #b3b3b3',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        />
        <div style={{ position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)' }}>
          <span style={VALUE_PILL_STYLE}>{formatUnitCompact(value.top)}</span>
        </div>
        <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}>
          <span style={VALUE_PILL_STYLE}>{formatUnitCompact(value.right)}</span>
        </div>
        <div
          style={{ position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)' }}
        >
          <span style={VALUE_PILL_STYLE}>{formatUnitCompact(value.bottom)}</span>
        </div>
        <div style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)' }}>
          <span style={VALUE_PILL_STYLE}>{formatUnitCompact(value.left)}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {row('top', 'T', (next) => onChange({ ...value, top: next }))}
        {row('right', 'R', (next) => onChange({ ...value, right: next }))}
        {row('bottom', 'B', (next) => onChange({ ...value, bottom: next }))}
        {row('left', 'L', (next) => onChange({ ...value, left: next }))}
      </div>
    </div>
  )
}

function CornerUnitWidget({
  value,
  disabled,
  onChange,
}: {
  value: CornerUnitValue
  disabled?: boolean
  onChange(this: void, value: CornerUnitValue): void
}) {
  const dis = disabled ?? false

  const row = (corner: keyof CornerUnitValue, label: string, next: (value: UnitValue) => void) => (
    <div key={corner} style={ROW_CARD_STYLE}>
      <span style={{ ...BOX_CHIP_STYLE, minWidth: 26 }}>{label}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <UnitInput value={value[corner]} disabled={dis} min={0} onChange={next} />
      </div>
    </div>
  )

  return (
    <div
      style={{ ...FANCY_PANEL_STYLE, display: 'grid', gridTemplateColumns: '78px 1fr', gap: 10 }}
    >
      <div
        style={{
          minHeight: 104,
          ...PREVIEW_CARD_STYLE,
          position: 'relative',
        }}
      >
        <div
          style={{
            ...PREVIEW_GLOW_STYLE,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 18,
            border: '1px solid #b3b3b3',
            borderTopLeftRadius: unitToCss(value.topLeft),
            borderTopRightRadius: unitToCss(value.topRight),
            borderBottomRightRadius: unitToCss(value.bottomRight),
            borderBottomLeftRadius: unitToCss(value.bottomLeft),
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        />
        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          <span style={VALUE_PILL_STYLE}>{formatUnitCompact(value.topLeft)}</span>
        </div>
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <span style={VALUE_PILL_STYLE}>{formatUnitCompact(value.topRight)}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
          <span style={VALUE_PILL_STYLE}>{formatUnitCompact(value.bottomRight)}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
          <span style={VALUE_PILL_STYLE}>{formatUnitCompact(value.bottomLeft)}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {row('topLeft', 'TL', (next) => onChange({ ...value, topLeft: next }))}
        {row('topRight', 'TR', (next) => onChange({ ...value, topRight: next }))}
        {row('bottomRight', 'BR', (next) => onChange({ ...value, bottomRight: next }))}
        {row('bottomLeft', 'BL', (next) => onChange({ ...value, bottomLeft: next }))}
      </div>
    </div>
  )
}

function SideColorWidget({
  value,
  disabled,
  onChange,
}: {
  value: SideColorValue
  disabled?: boolean
  onChange(this: void, value: SideColorValue): void
}) {
  const dis = disabled ?? false

  const row = (side: keyof SideColorValue, label: string, next: (value: string) => void) => {
    const color = value[side]
    const pickerValue = color !== '' ? color : '#ffffff'

    return (
      <div key={side} style={ROW_CARD_STYLE}>
        <span style={BOX_CHIP_STYLE}>{label}</span>
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
            flexShrink: 0,
          }}
          onChange={(e) => next(e.target.value)}
        />
        <input
          value={color}
          placeholder="—"
          disabled={dis}
          style={{ ...INPUT_STYLE, flex: 1, minWidth: 0 }}
          onChange={(e) => next(e.target.value)}
        />
      </div>
    )
  }

  return (
    <div
      style={{ ...FANCY_PANEL_STYLE, display: 'grid', gridTemplateColumns: '78px 1fr', gap: 10 }}
    >
      <div
        style={{
          ...PREVIEW_CARD_STYLE,
          minHeight: 104,
          position: 'relative',
        }}
      >
        <div
          style={{
            ...PREVIEW_GLOW_STYLE,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 20,
            right: 20,
            height: 5,
            background: value.top || '#707070',
            borderRadius: 999,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 20,
            right: 20,
            height: 5,
            background: value.bottom || '#707070',
            borderRadius: 999,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 20,
            bottom: 20,
            left: 10,
            width: 5,
            background: value.left || '#707070',
            borderRadius: 999,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 20,
            bottom: 20,
            right: 10,
            width: 5,
            background: value.right || '#707070',
            borderRadius: 999,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 22,
            borderRadius: 6,
            border: '1px solid #ababab',
            background: '#242424',
          }}
        />
        <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)' }}>
          <span style={{ ...BOX_CHIP_STYLE, minWidth: 22, height: 14, fontSize: 8 }}>T</span>
        </div>
        <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}>
          <span style={{ ...BOX_CHIP_STYLE, minWidth: 14, height: 14, fontSize: 8 }}>R</span>
        </div>
        <div
          style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)' }}
        >
          <span style={{ ...BOX_CHIP_STYLE, minWidth: 22, height: 14, fontSize: 8 }}>B</span>
        </div>
        <div style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)' }}>
          <span style={{ ...BOX_CHIP_STYLE, minWidth: 14, height: 14, fontSize: 8 }}>L</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {row('top', 'T', (next) => onChange({ ...value, top: next }))}
        {row('right', 'R', (next) => onChange({ ...value, right: next }))}
        {row('bottom', 'B', (next) => onChange({ ...value, bottom: next }))}
        {row('left', 'L', (next) => onChange({ ...value, left: next }))}
      </div>
    </div>
  )
}

function BorderSectionPanel({
  node,
  controls,
  disabled,
  breakpoints,
  breakpoint,
  styleState,
}: {
  node: NxNode
  controls: ControlDefinition[]
  disabled: boolean
  breakpoints: BreakpointConfig[]
  breakpoint: Breakpoint
  styleState: StyleState
}) {
  const styleControl = controls.find((control) => control.id === 'border-style') as
    | SelectControl
    | undefined
  const widthControl = controls.find((control) => control.id === 'border-width') as
    | UnitBoxControl
    | undefined
  const colorControl = controls.find((control) => control.id === 'border-color') as
    | ColorBoxControl
    | undefined
  const radiusControl = controls.find((control) => control.id === 'border-radius') as
    | UnitBoxControl
    | undefined

  const [selectedSides, setSelectedSides] = useState<BorderSide[]>(['top'])
  const [radiusMode, setRadiusMode] = useState<'all' | 'selection'>('all')
  const [showCornerPicker, setShowCornerPicker] = useState(false)
  const [selectedCorners, setSelectedCorners] = useState<BorderCorner[]>(['topLeft'])

  if (!styleControl || !widthControl || !colorControl || !radiusControl) {
    return (
      <>
        {controls.map((control) => (
          <div key={control.id}>
            {renderControl(node, control, disabled, breakpoints, breakpoint, styleState)}
          </div>
        ))}
      </>
    )
  }

  const styleLocked = disabled || isBreakpointLocked(node, styleControl, breakpoint, styleState)
  const widthLocked = disabled || isBreakpointLocked(node, widthControl, breakpoint, styleState)
  const colorLocked = disabled || isBreakpointLocked(node, colorControl, breakpoint, styleState)
  const radiusLocked = disabled || isBreakpointLocked(node, radiusControl, breakpoint, styleState)

  const rawStyle = readProp(
    node,
    styleControl,
    styleControl.defaultValue ?? 'none',
    breakpoints,
    breakpoint,
    styleState,
  )
  const currentStyle = typeof rawStyle === 'string' ? rawStyle : 'none'

  const rawWidth = readProp(
    node,
    widthControl,
    widthControl.defaultValue,
    breakpoints,
    breakpoint,
    styleState,
  )
  const widthValue = normalizeSideUnitValue(
    rawWidth,
    (widthControl.defaultValue as SideUnitValue | undefined) ?? sideUnitValue(unitValue()),
  )

  const rawColor = readProp(
    node,
    colorControl,
    colorControl.defaultValue,
    breakpoints,
    breakpoint,
    styleState,
  )
  const colorValue = normalizeSideColorValue(
    rawColor,
    colorControl.defaultValue ?? sideColorValue(),
  )

  const rawRadius = readProp(
    node,
    radiusControl,
    radiusControl.defaultValue,
    breakpoints,
    breakpoint,
    styleState,
  )
  const radiusValue = normalizeCornerUnitValue(
    isTokenRef(rawRadius) ? radiusControl.defaultValue : rawRadius,
    (radiusControl.defaultValue as CornerUnitValue | undefined) ?? cornerUnitValue(),
  )

  const styleButtons = [
    { value: 'none', label: '×' },
    { value: 'solid', label: '—' },
    { value: 'dashed', label: '---' },
    { value: 'dotted', label: '···' },
    { value: 'double', label: '=' },
  ]

  const sidePositions: Record<BorderSide, React.CSSProperties> = {
    top: { top: 0, left: '50%', transform: 'translateX(-50%)' },
    left: { top: '50%', left: 0, transform: 'translateY(-50%)' },
    right: { top: '50%', right: 0, transform: 'translateY(-50%)' },
    bottom: { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
  }
  const activeSide = selectedSides[0] ?? 'top'
  const selectedWidth = widthValue[activeSide]
  const selectedColor = colorValue[activeSide] || '#000000'
  const activeCorner = selectedCorners[0] ?? 'topLeft'
  const selectedRadius = radiusMode === 'all' ? radiusValue.topLeft : radiusValue[activeCorner]

  const toggleSide = (side: BorderSide) => {
    setSelectedSides((current) => {
      if (current.includes(side)) {
        return current.length === 1 ? current : current.filter((value) => value !== side)
      }
      return [...current, side]
    })
  }

  const toggleCorner = (corner: BorderCorner) => {
    setSelectedCorners((current) => {
      if (current.includes(corner)) {
        return current.length === 1 ? current : current.filter((value) => value !== corner)
      }
      return [...current, corner]
    })
  }

  const setRadiusValue = (next: UnitValue) => {
    if (radiusMode === 'all') {
      updateNode(
        node,
        radiusControl,
        { topLeft: next, topRight: next, bottomRight: next, bottomLeft: next },
        breakpoints,
        breakpoint,
        styleState,
      )
      return
    }

    const nextValue = { ...radiusValue }
    selectedCorners.forEach((corner) => {
      nextValue[corner] = next
    })
    updateNode(node, radiusControl, nextValue, breakpoints, breakpoint, styleState)
  }

  const updateSelectedSidesWidth = (patch: Partial<UnitValue>) => {
    const nextValue = { ...widthValue }
    selectedSides.forEach((side) => {
      nextValue[side] = { ...widthValue[side], ...patch }
    })
    updateNode(node, widthControl, nextValue, breakpoints, breakpoint, styleState)
  }

  const updateSelectedSidesColor = (nextColor: string, onRawChange: (v: unknown) => void) => {
    const nextValue = { ...colorValue }
    selectedSides.forEach((side) => {
      nextValue[side] = nextColor
    })
    onRawChange(nextValue)
  }

  return (
    <div style={BORDER_PANEL_STYLE} data-testid="border-section-panel">
      <div style={BORDER_SECTION_ROW_STYLE}>
        <div style={BORDER_LABEL_STYLE}>Radius</div>
        <button
          type="button"
          aria-label="Adjust all border radius corners"
          disabled={radiusLocked}
          style={{
            ...BORDER_ICON_BUTTON_STYLE,
            background: radiusMode === 'all' ? '#262626' : '#343434',
            color: radiusMode === 'all' ? '#fff' : '#888',
            cursor: radiusLocked ? 'not-allowed' : 'pointer',
          }}
          onClick={() => {
            setRadiusMode('all')
            setShowCornerPicker(false)
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              border: '2px solid #e8e8e8',
              borderRadius: 3,
            }}
          />
        </button>
        <button
          type="button"
          aria-label="Adjust selected border radius corners"
          disabled={radiusLocked}
          style={{
            ...BORDER_ICON_BUTTON_STYLE,
            borderStyle: 'dashed',
            color: radiusMode === 'selection' ? '#fff' : '#888',
            background: radiusMode === 'selection' ? '#262626' : '#343434',
            cursor: radiusLocked ? 'not-allowed' : 'pointer',
          }}
          onClick={() => {
            setRadiusMode('selection')
            setShowCornerPicker((current) => !current)
          }}
        >
          <Icon icon="tabler:box-multiple" width={12} height={12} />
        </button>
        <div style={{ flex: 1, minWidth: 0, padding: '0 2px' }}>
          <Slider
            data-testid="border-radius-range"
            min={0}
            max={200}
            step={1}
            disabled={radiusLocked}
            value={[selectedRadius.value]}
            onValueChange={(value) =>
              setRadiusValue({
                ...selectedRadius,
                value: value[0] ?? 0,
              })
            }
          />
        </div>
        <div style={BORDER_NUMBER_STYLE}>
          <input
            data-testid="border-radius-input"
            type="number"
            value={selectedRadius.value}
            min={0}
            disabled
            readOnly
            style={BORDER_VALUE_INPUT_STYLE}
          />
          <select
            aria-label="Border radius unit"
            value={selectedRadius.unit}
            disabled={radiusLocked}
            style={{
              ...SELECT_STYLE,
              width: 50,
              minWidth: 50,
              height: 22,
              border: 'none',
              backgroundColor: 'transparent',
              padding: 0,
            }}
            onChange={(e) =>
              setRadiusValue({
                ...selectedRadius,
                unit: e.target.value as CssUnit,
              })
            }
          >
            {CSS_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        {showResponsiveAdornmentFor(radiusControl, breakpoint) && (
          <ResponsiveAdornment
            node={node}
            control={radiusControl}
            breakpoint={breakpoint}
            breakpoints={breakpoints}
            styleState={styleState}
          />
        )}
      </div>

      {showCornerPicker && radiusMode === 'selection' && (
        <div
          style={{
            padding: '8px 12px 10px 74px',
            borderBottom: '1px solid #373737',
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          {(['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as BorderCorner[]).map(
            (corner) => {
              const active = selectedCorners.includes(corner)
              return (
                <button
                  key={corner}
                  type="button"
                  aria-label={`Toggle ${cornerLabel(corner)} radius`}
                  disabled={radiusLocked}
                  style={{
                    height: 22,
                    padding: '0 8px',
                    borderRadius: 999,
                    border: `1px solid ${active ? '#6e8fb8' : '#4e4e4e'}`,
                    background: active ? '#2b333d' : '#343434',
                    color: active ? '#f0f0f0' : '#aaa',
                    fontSize: 10,
                    cursor: radiusLocked ? 'not-allowed' : 'pointer',
                  }}
                  onClick={() => toggleCorner(corner)}
                >
                  {cornerLabel(corner)}
                </button>
              )
            },
          )}
        </div>
      )}

      <div style={{ padding: '12px' }}>
        <div style={{ ...FANCY_PANEL_LABEL_STYLE, marginBottom: 10, color: '#d7d7d7' }}>
          Borders
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '90px 1fr',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              position: 'relative',
              justifySelf: 'center',
            }}
          >
            {(['top', 'left', 'right', 'bottom'] as BorderSide[]).map((side) => (
              <button
                key={side}
                type="button"
                aria-label={`Edit ${sideLabel(side)} border`}
                disabled={widthLocked && colorLocked}
                style={{
                  ...BORDER_SIDE_BUTTON_BASE_STYLE,
                  ...sidePositions[side],
                  width: side === 'top' || side === 'bottom' ? 32 : 20,
                  height: side === 'top' || side === 'bottom' ? 20 : 32,
                  background: selectedSides.includes(side) ? '#262626' : 'transparent',
                  borderRadius: 6,
                  boxShadow: selectedSides.includes(side)
                    ? '0 0 0 1px rgba(255,255,255,0.04)'
                    : 'none',
                }}
                onClick={() => toggleSide(side)}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 16,
                    height: 16,
                    border: '2px solid #6f6f6f',
                    borderRadius: 1,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      ...borderSideEdgeStyle(side, selectedSides.includes(side)),
                    }}
                  />
                </div>
              </button>
            ))}
            <div
              style={{
                position: 'absolute',
                top: 28,
                left: 28,
                width: 34,
                height: 34,
                background: '#2d2d2d',
                borderRadius: 6,
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.04)',
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderStyle: currentStyle === 'none' ? 'solid' : currentStyle,
                  borderWidth: 2,
                  borderColor: '#eee',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr',
                gap: 10,
                alignItems: 'center',
                position: 'relative',
                paddingRight: showResponsiveAdornmentFor(styleControl, breakpoint) ? 88 : 0,
              }}
            >
              <div style={BORDER_LABEL_STYLE}>Style</div>
              <div style={{ display: 'flex', height: 28 }}>
                {styleButtons.map((button) => (
                  <button
                    key={button.value}
                    type="button"
                    aria-label={`Border style ${button.value}`}
                    disabled={styleLocked}
                    style={{
                      ...BORDER_STYLE_BUTTON_BASE,
                      background: currentStyle === button.value ? '#262626' : '#555',
                      color: currentStyle === button.value ? '#fff' : '#bbb',
                    }}
                    onClick={() =>
                      updateNode(
                        node,
                        styleControl,
                        button.value,
                        breakpoints,
                        breakpoint,
                        styleState,
                      )
                    }
                  >
                    {button.label}
                  </button>
                ))}
              </div>
              {showResponsiveAdornmentFor(styleControl, breakpoint) && (
                <ResponsiveAdornment
                  node={node}
                  control={styleControl}
                  breakpoint={breakpoint}
                  breakpoints={breakpoints}
                  styleState={styleState}
                />
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr',
                gap: 10,
                alignItems: 'center',
                position: 'relative',
                paddingRight: showResponsiveAdornmentFor(widthControl, breakpoint) ? 88 : 0,
              }}
            >
              <div style={BORDER_LABEL_STYLE}>Width</div>
              <div style={BORDER_NUMBER_STYLE}>
                <span style={{ color: '#8f8f8f', fontSize: 10, minWidth: 52 }}>
                  {selectionLabel(selectedSides.map((side) => sideLabel(side)))}
                </span>
                <input
                  data-testid="border-width-input"
                  type="number"
                  value={selectedWidth.value}
                  min={0}
                  disabled={widthLocked}
                  style={{
                    ...INPUT_STYLE,
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    height: 'auto',
                  }}
                  onChange={(e) => updateSelectedSidesWidth({ value: Number(e.target.value) })}
                />
                <select
                  aria-label="Border width unit"
                  value={selectedWidth.unit}
                  disabled={widthLocked}
                  style={{
                    ...SELECT_STYLE,
                    width: 46,
                    height: 22,
                    border: 'none',
                    backgroundColor: 'transparent',
                    padding: 0,
                  }}
                  onChange={(e) => updateSelectedSidesWidth({ unit: e.target.value as CssUnit })}
                >
                  {CSS_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              {showResponsiveAdornmentFor(widthControl, breakpoint) && (
                <ResponsiveAdornment
                  node={node}
                  control={widthControl}
                  breakpoint={breakpoint}
                  breakpoints={breakpoints}
                  styleState={styleState}
                />
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr',
                gap: 10,
                alignItems: 'center',
                position: 'relative',
                paddingRight: showResponsiveAdornmentFor(colorControl, breakpoint) ? 88 : 0,
              }}
            >
              <div style={BORDER_LABEL_STYLE}>Color</div>
              <TokenOrValue
                value={rawColor}
                group={colorControl.tokenGroup ?? 'color'}
                disabled={colorLocked}
                onChange={(v) =>
                  updateNode(node, colorControl, v, breakpoints, breakpoint, styleState)
                }
              >
                {(_, onRawChange, isDis) => (
                  <div
                    style={{
                      display: 'flex',
                      height: 28,
                      background: '#2e2e2e',
                      border: '1px solid #222',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <input
                      aria-label={`Border ${sideLabel(activeSide)} color`}
                      type="color"
                      value={selectedColor}
                      disabled={isDis}
                      style={{
                        width: 34,
                        border: 'none',
                        background: '#000',
                        padding: 0,
                        cursor: isDis ? 'not-allowed' : 'pointer',
                      }}
                      onChange={(e) => updateSelectedSidesColor(e.target.value, onRawChange)}
                    />
                    <input
                      value={colorValue[activeSide]}
                      placeholder={selectionLabel(selectedSides.map((side) => sideLabel(side)))}
                      disabled={isDis}
                      style={{
                        ...INPUT_STYLE,
                        border: 'none',
                        background: 'transparent',
                        borderRadius: 0,
                      }}
                      onChange={(e) => updateSelectedSidesColor(e.target.value, onRawChange)}
                    />
                  </div>
                )}
              </TokenOrValue>
              {showResponsiveAdornmentFor(colorControl, breakpoint) && (
                <ResponsiveAdornment
                  node={node}
                  control={colorControl}
                  breakpoint={breakpoint}
                  breakpoints={breakpoints}
                  styleState={styleState}
                />
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            display: 'grid',
            gridTemplateColumns: '90px 1fr',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              position: 'relative',
              justifySelf: 'center',
              background: '#2d2d2d',
              borderRadius: 8,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 20,
                border: '2px solid #eee',
                borderTopLeftRadius: unitToCss(radiusValue.topLeft),
                borderTopRightRadius: unitToCss(radiusValue.topRight),
                borderBottomRightRadius: unitToCss(radiusValue.bottomRight),
                borderBottomLeftRadius: unitToCss(radiusValue.bottomLeft),
              }}
            />
          </div>
          <div style={{ fontSize: 10, color: '#a5a5a5' }}>
            {radiusMode === 'all'
              ? 'Editing all corners'
              : `Editing ${selectionLabel(selectedCorners.map((corner) => cornerLabel(corner).toLowerCase()))}`}
          </div>
        </div>
      </div>
    </div>
  )
}

function SpacingSectionPanel({
  node,
  controls,
  disabled,
  breakpoints,
  breakpoint,
  styleState,
}: {
  node: NxNode
  controls: ControlDefinition[]
  disabled: boolean
  breakpoints: BreakpointConfig[]
  breakpoint: Breakpoint
  styleState: StyleState
}) {
  const marginControl = controls.find((control) => control.id === 'margin') as
    | (KnownControl & { type: 'spacing' })
    | undefined
  const paddingControl = controls.find((control) => control.id === 'padding') as
    | (KnownControl & { type: 'spacing' })
    | undefined

  const [selectedGroup, setSelectedGroup] = useState<'margin' | 'padding' | null>(null)
  const [selectedSides, setSelectedSides] = useState<BorderSide[]>([])

  if (!marginControl || !paddingControl) {
    return (
      <>
        {controls.map((control) => (
          <div key={control.id}>
            {renderControl(node, control, disabled, breakpoints, breakpoint, styleState)}
          </div>
        ))}
      </>
    )
  }

  const marginLocked = disabled || isBreakpointLocked(node, marginControl, breakpoint, styleState)
  const paddingLocked = disabled || isBreakpointLocked(node, paddingControl, breakpoint, styleState)

  const marginValue = normalizeSpacingValue(
    readProp(node, marginControl, marginControl.defaultValue, breakpoints, breakpoint, styleState),
    marginControl.defaultValue ?? spacingValue(),
  )
  const paddingValue = normalizeSpacingValue(
    readProp(
      node,
      paddingControl,
      paddingControl.defaultValue,
      breakpoints,
      breakpoint,
      styleState,
    ),
    paddingControl.defaultValue ?? spacingValue(),
  )

  const activeControl = selectedGroup === 'padding' ? paddingControl : marginControl
  const activeValue = selectedGroup === 'padding' ? paddingValue : marginValue
  const activeLocked = selectedGroup === 'padding' ? paddingLocked : marginLocked
  const activeSide = selectedSides[0] ?? 'top'
  const activeUnitValue = activeValue[activeSide]

  const toggleSelection = (group: 'margin' | 'padding', side: BorderSide) => {
    const locked = group === 'padding' ? paddingLocked : marginLocked
    if (locked) return

    if (selectedGroup !== group) {
      setSelectedGroup(group)
      setSelectedSides([side])
      return
    }

    setSelectedSides((current) => {
      if (current.includes(side)) {
        const next = current.filter((item) => item !== side)
        if (next.length === 0) {
          setSelectedGroup(null)
        }
        return next
      }

      return [...current, side]
    })
  }

  const applySpacingPatch = (patch: Partial<UnitValue>) => {
    if (!selectedGroup || selectedSides.length === 0) return

    const control = selectedGroup === 'padding' ? paddingControl : marginControl
    const currentValue = selectedGroup === 'padding' ? paddingValue : marginValue
    const nextValue = { ...currentValue }

    selectedSides.forEach((side) => {
      nextValue[side] = { ...currentValue[side], ...patch }
    })

    updateNode(node, control, nextValue, breakpoints, breakpoint, styleState)
  }

  const resetSpacing = () => {
    updateNode(
      node,
      marginControl,
      marginControl.defaultValue ?? spacingValue(unitValue(0)),
      breakpoints,
      breakpoint,
      styleState,
    )
    updateNode(
      node,
      paddingControl,
      paddingControl.defaultValue ?? spacingValue(unitValue(0)),
      breakpoints,
      breakpoint,
      styleState,
    )
    setSelectedGroup(null)
    setSelectedSides([])
  }

  const hasSelection = selectedGroup !== null && selectedSides.length > 0
  const sameValue =
    hasSelection && selectedSides.every((side) => activeValue[side].value === activeUnitValue.value)
  const sameUnit =
    hasSelection && selectedSides.every((side) => activeValue[side].unit === activeUnitValue.unit)

  return (
    <div style={SPACING_PANEL_STYLE}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 0, paddingRight: 92 }}>
          <strong style={{ display: 'block', fontSize: 12, color: '#e5e5e5' }}>Spacing</strong>
          <span style={{ display: 'block', marginTop: 3, fontSize: 10, color: '#7f8792' }}>
            {hasSelection
              ? `${selectedGroup === 'margin' ? 'Margin' : 'Padding'}: ${selectedSides.join(', ')} selected`
              : 'No side selected'}
          </span>
          {showResponsiveAdornmentFor(activeControl, breakpoint) && (
            <ResponsiveAdornment
              node={node}
              control={activeControl}
              breakpoint={breakpoint}
              breakpoints={breakpoints}
              styleState={styleState}
            />
          )}
        </div>
        <button
          type="button"
          onClick={resetSpacing}
          style={{
            height: 28,
            borderRadius: 4,
            border: '1px solid #333',
            background: '#1a1a1a',
            color: '#bdbdbd',
            padding: '0 10px',
            fontSize: 12,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Reset
        </button>
      </div>

      <div
        style={{
          position: 'relative',
          height: 240,
          borderRadius: 6,
          background: 'linear-gradient(180deg, rgba(44,44,44,0.95), rgba(32,32,32,1))',
          border: '1px solid #343434',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 12,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#6f8fb1',
            pointerEvents: 'none',
          }}
        >
          Margin
        </span>

        {(['top', 'right', 'bottom', 'left'] as BorderSide[]).map((side) => {
          const active = selectedGroup === 'margin' && selectedSides.includes(side)
          return (
            <button
              key={`margin-${side}`}
              type="button"
              disabled={marginLocked}
              aria-label={`Toggle margin ${side}`}
              style={{
                ...SPACING_SIDE_BUTTON_STYLE,
                ...spacingSidePosition(side),
                color: active ? '#fff' : '#e5e7eb',
                borderColor: active ? '#4a9eff' : '#3a3a3a',
                background: active ? 'rgba(74,158,255,0.14)' : '#1b1b1b',
                boxShadow: active ? 'inset 0 0 0 1px rgba(74,158,255,0.24)' : 'none',
                cursor: marginLocked ? 'not-allowed' : 'pointer',
              }}
              onClick={() => toggleSelection('margin', side)}
            >
              {marginValue[side].value}
            </button>
          )
        })}

        <div
          style={{
            position: 'absolute',
            inset: 52,
            borderRadius: 6,
            background: 'linear-gradient(180deg, rgba(36,44,40,0.96), rgba(28,34,31,1))',
            border: '1px solid #314139',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 10,
              left: 12,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#73b494',
              pointerEvents: 'none',
            }}
          >
            Padding
          </span>

          {(['top', 'right', 'bottom', 'left'] as BorderSide[]).map((side) => {
            const active = selectedGroup === 'padding' && selectedSides.includes(side)
            return (
              <button
                key={`padding-${side}`}
                type="button"
                disabled={paddingLocked}
                aria-label={`Toggle padding ${side}`}
                style={{
                  ...SPACING_SIDE_BUTTON_STYLE,
                  ...spacingSidePosition(side),
                  color: active ? '#fff' : '#e5e7eb',
                  borderColor: active ? '#58c495' : '#3a3a3a',
                  background: active ? 'rgba(88,196,149,0.16)' : '#1b1b1b',
                  boxShadow: active ? 'inset 0 0 0 1px rgba(88,196,149,0.22)' : 'none',
                  cursor: paddingLocked ? 'not-allowed' : 'pointer',
                }}
                onClick={() => toggleSelection('padding', side)}
              >
                {paddingValue[side].value}
              </button>
            )
          })}

          <div
            style={{
              position: 'absolute',
              inset: 58,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 4,
              background: '#181818',
              border: '1px solid #303030',
              color: '#bfc5cf',
              fontSize: 13,
            }}
          >
            Content
          </div>
        </div>
      </div>

      {hasSelection && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 6,
            background: '#1a1a1a',
            border: '1px solid #303030',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ minWidth: 0, padding: '0 2px' }}>
              <Slider
                data-testid="spacing-slider"
                min={0}
                max={128}
                step={1}
                disabled={activeLocked}
                value={[sameValue ? activeUnitValue.value : 0]}
                onValueChange={(value) => applySpacingPatch({ value: value[0] ?? 0 })}
              />
            </div>
            <div style={BORDER_NUMBER_STYLE}>
              <input
                type="text"
                value={sameValue ? activeUnitValue.value : 'mixed'}
                readOnly
                disabled
                style={{
                  ...BORDER_VALUE_INPUT_STYLE,
                  width: 44,
                  minWidth: 44,
                  textAlign: 'center',
                }}
              />
              <select
                value={sameUnit ? activeUnitValue.unit : 'px'}
                disabled={activeLocked}
                style={{
                  ...SELECT_STYLE,
                  width: 50,
                  minWidth: 50,
                  height: 22,
                  border: 'none',
                  backgroundColor: 'transparent',
                  padding: 0,
                }}
                onChange={(e) => applySpacingPatch({ unit: e.target.value as CssUnit })}
              >
                {CSS_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              display: 'grid',
              gridTemplateColumns: 'repeat(9, minmax(0, 1fr))',
              gap: 6,
            }}
          >
            {[0, 4, 8, 12, 16, 24, 32, 48, 64].map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={activeLocked}
                style={{
                  height: 28,
                  minWidth: 0,
                  width: '100%',
                  padding: '0 6px',
                  borderRadius: 4,
                  fontSize: 11,
                  border: '1px solid #333',
                  background: '#202020',
                  color: '#cbd5e1',
                  cursor: activeLocked ? 'not-allowed' : 'pointer',
                }}
                onClick={() => applySpacingPatch({ value: preset })}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
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
  styleState: StyleState,
) {
  const locked = isBreakpointLocked(node, control, breakpoint, styleState)
  const dis = disabled || control.disabled === true || locked

  switch (control.type) {
    case 'text': {
      const c = control as KnownControl & { type: 'text' }
      const value = readProp(node, c, c.defaultValue ?? '', breakpoints, breakpoint, styleState)
      return (
        <FieldRow control={control}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input
              value={value}
              placeholder={c.placeholder}
              disabled={dis}
              style={INPUT_STYLE}
              onChange={(e) =>
                updateNode(node, c, e.target.value, breakpoints, breakpoint, styleState)
              }
            />
            {c.mediaType === 'image' && (
              <MediaPickerButton
                disabled={dis}
                onSelect={(next) => updateNode(node, c, next, breakpoints, breakpoint, styleState)}
              />
            )}
          </div>
        </FieldRow>
      )
    }

    case 'textarea': {
      const c = control as KnownControl & { type: 'textarea' }
      const value = readProp(node, c, c.defaultValue ?? '', breakpoints, breakpoint, styleState)
      return (
        <FieldBlock control={control}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
            <textarea
              value={value}
              placeholder={c.placeholder}
              disabled={dis}
              style={{ ...INPUT_STYLE, height: 64, padding: '4px 6px', resize: 'vertical' }}
              onChange={(e) =>
                updateNode(node, c, e.target.value, breakpoints, breakpoint, styleState)
              }
            />
            {c.mediaType === 'image' && (
              <MediaPickerButton
                disabled={dis}
                onSelect={(next) => updateNode(node, c, next, breakpoints, breakpoint, styleState)}
              />
            )}
          </div>
        </FieldBlock>
      )
    }

    case 'number': {
      const c = control as KnownControl & { type: 'number' }
      const value = readProp(node, c, c.defaultValue ?? 0, breakpoints, breakpoint, styleState)
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
            onChange={(e) =>
              updateNode(node, c, Number(e.target.value), breakpoints, breakpoint, styleState)
            }
          />
        </FieldRow>
      )
    }

    case 'slider': {
      const c = control as KnownControl & { type: 'slider' }
      const value = readProp(node, c, c.defaultValue ?? c.min, breakpoints, breakpoint, styleState)
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
              onChange={(e) =>
                updateNode(node, c, Number(e.target.value), breakpoints, breakpoint, styleState)
              }
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
        styleState,
      )
      return (
        <FieldRow control={control}>
          <SelectInput
            node={node}
            control={c}
            value={value}
            disabled={dis}
            breakpoint={breakpoint}
            breakpoints={breakpoints}
            styleState={styleState}
          />
        </FieldRow>
      )
    }

    case 'toggle': {
      const c = control as KnownControl & { type: 'toggle' }
      const value = readProp(node, c, c.defaultValue ?? false, breakpoints, breakpoint, styleState)
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
            onChange={(e) =>
              updateNode(node, c, e.target.checked, breakpoints, breakpoint, styleState)
            }
          />
        </label>
      )
    }

    case 'color': {
      const c = control as KnownControl & { type: 'color' }
      const rawValue = readProp(node, c, c.defaultValue ?? '', breakpoints, breakpoint, styleState)
      return (
        <FieldRow control={control}>
          <TokenOrValue
            value={rawValue}
            group="color"
            disabled={dis}
            onChange={(v) => updateNode(node, c, v, breakpoints, breakpoint, styleState)}
          >
            {(value, onRawChange, isDis) => {
              const colorStr = typeof value === 'string' ? value : ''
              const pickerValue = colorStr !== '' ? colorStr : '#ffffff'
              return (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: 24, height: 24, flexShrink: 0 }}>
                    {colorStr === '' && (
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
                      disabled={isDis}
                      style={{
                        width: 24,
                        height: 24,
                        padding: 2,
                        border: '1px solid #333',
                        borderRadius: 3,
                        background: '#252525',
                        cursor: isDis ? 'not-allowed' : 'pointer',
                        opacity: isDis ? 0.5 : 1,
                      }}
                      onChange={(e) => onRawChange(e.target.value)}
                    />
                  </div>
                  <input
                    value={colorStr}
                    placeholder="—"
                    disabled={isDis}
                    style={{ ...INPUT_STYLE, flex: 1, minWidth: 0 }}
                    onChange={(e) => onRawChange(e.target.value)}
                  />
                  {colorStr !== '' && (
                    <button
                      type="button"
                      title="Clear"
                      disabled={isDis}
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
                      onClick={() => onRawChange('')}
                    >
                      ×
                    </button>
                  )}
                </div>
              )
            }}
          </TokenOrValue>
        </FieldRow>
      )
    }

    case 'unit': {
      const c = control as KnownControl & { type: 'unit' }
      const rawProp = readProp(node, c, c.defaultValue, breakpoints, breakpoint, styleState)
      const value = normalizeUnitValue(
        isTokenRef(rawProp) ? c.defaultValue : rawProp,
        c.defaultValue ?? unitValue(),
      )
      if (c.tokenGroup) {
        return (
          <FieldRow control={control}>
            <TokenOrValue
              value={rawProp}
              group={c.tokenGroup}
              disabled={dis}
              onChange={(v) => updateNode(node, c, v, breakpoints, breakpoint, styleState)}
            >
              {(_, onRawChange, isDis) => (
                <UnitInput
                  value={value}
                  disabled={isDis}
                  {...unitInputProps(c)}
                  onChange={(next) => onRawChange(next)}
                />
              )}
            </TokenOrValue>
          </FieldRow>
        )
      }
      return (
        <FieldRow control={control}>
          <UnitInput
            value={value}
            disabled={dis}
            {...unitInputProps(c)}
            onChange={(next) => updateNode(node, c, next, breakpoints, breakpoint, styleState)}
          />
        </FieldRow>
      )
    }

    case 'unit-box': {
      const c = control as UnitBoxControl
      const rawProp = readProp(node, c, c.defaultValue, breakpoints, breakpoint, styleState)
      const normalizedValue =
        c.mode === 'corners'
          ? normalizeCornerUnitValue(
              rawProp,
              (c.defaultValue as CornerUnitValue | undefined) ?? cornerUnitValue(),
            )
          : normalizeSideUnitValue(
              rawProp,
              (c.defaultValue as SideUnitValue | undefined) ?? sideUnitValue(unitValue()),
            )

      const widget =
        c.mode === 'corners' ? (
          <CornerUnitWidget
            value={normalizedValue as CornerUnitValue}
            disabled={dis}
            onChange={(next) => updateNode(node, c, next, breakpoints, breakpoint, styleState)}
          />
        ) : (
          <SideUnitWidget
            value={normalizedValue as SideUnitValue}
            disabled={dis}
            onChange={(next) => updateNode(node, c, next, breakpoints, breakpoint, styleState)}
          />
        )

      if (c.tokenGroup) {
        return (
          <FieldBlock control={control}>
            <TokenOrValue
              value={rawProp}
              group={c.tokenGroup}
              disabled={dis}
              onChange={(v) => updateNode(node, c, v, breakpoints, breakpoint, styleState)}
            >
              {() => widget}
            </TokenOrValue>
          </FieldBlock>
        )
      }

      return <FieldBlock control={control}>{widget}</FieldBlock>
    }

    case 'color-box': {
      const c = control as ColorBoxControl
      const rawProp = readProp(node, c, c.defaultValue, breakpoints, breakpoint, styleState)
      const value = normalizeSideColorValue(rawProp, c.defaultValue ?? sideColorValue())

      return (
        <FieldBlock control={control}>
          <TokenOrValue
            value={rawProp}
            group={c.tokenGroup ?? 'color'}
            disabled={dis}
            onChange={(v) => updateNode(node, c, v, breakpoints, breakpoint, styleState)}
          >
            {() => (
              <SideColorWidget
                value={value}
                disabled={dis}
                onChange={(next) => updateNode(node, c, next, breakpoints, breakpoint, styleState)}
              />
            )}
          </TokenOrValue>
        </FieldBlock>
      )
    }

    case 'spacing': {
      const c = control as KnownControl & { type: 'spacing' }
      const value = normalizeSpacingValue(
        readProp(node, c, c.defaultValue, breakpoints, breakpoint, styleState),
        c.defaultValue ?? spacingValue(),
      )
      return (
        <FieldBlock control={control}>
          <SpacingWidget
            value={value}
            disabled={dis}
            title={control.label}
            onChange={(next) => updateNode(node, c, next, breakpoints, breakpoint, styleState)}
          />
        </FieldBlock>
      )
    }

    case 'shadow': {
      const c = control as KnownControl & { type: 'shadow' }
      const rawProp = readProp(node, c, c.defaultValue, breakpoints, breakpoint, styleState)
      const value = rawProp
      return (
        <FieldBlock control={control}>
          <TokenOrValue
            value={rawProp}
            group={c.tokenGroup ?? 'effect'}
            disabled={dis}
            onChange={(v) => updateNode(node, c, v, breakpoints, breakpoint, styleState)}
          >
            {() => (
              <ShadowInput
                value={value}
                disabled={dis}
                onChange={(next) => updateNode(node, c, next, breakpoints, breakpoint, styleState)}
              />
            )}
          </TokenOrValue>
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
  const styleState = useUiStore((s) => s.activeStyleState)
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
          {section.id === 'border' ? (
            <BorderSectionPanel
              node={node}
              controls={section.controls}
              disabled={disabled}
              breakpoints={breakpoints}
              breakpoint={breakpoint}
              styleState={styleState}
            />
          ) : section.id === 'spacing' ? (
            <SpacingSectionPanel
              node={node}
              controls={section.controls}
              disabled={disabled}
              breakpoints={breakpoints}
              breakpoint={breakpoint}
              styleState={styleState}
            />
          ) : (
            section.controls.map((control) => {
              const showResponsiveAdornment = showResponsiveAdornmentFor(control, breakpoint)
              return (
                <div
                  key={control.id}
                  style={{ position: 'relative', paddingRight: showResponsiveAdornment ? 88 : 0 }}
                >
                  {renderControl(node, control, disabled, breakpoints, breakpoint, styleState)}
                  {showResponsiveAdornment && (
                    <ResponsiveAdornment
                      node={node}
                      control={control}
                      breakpoint={breakpoint}
                      breakpoints={breakpoints}
                      styleState={styleState}
                    />
                  )}
                </div>
              )
            })
          )}
        </InspectorSection>
      ))}
    </>
  )
}
