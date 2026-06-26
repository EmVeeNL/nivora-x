import type { TokenGroup } from '@/tokens/model'

export const CSS_UNITS = ['px', '%', 'rem', 'em', 'vh', 'vw'] as const

export type CssUnit = (typeof CSS_UNITS)[number]

export interface UnitValue {
  value: number
  unit: CssUnit
}

export interface SpacingValue {
  top: UnitValue
  right: UnitValue
  bottom: UnitValue
  left: UnitValue
}

export interface SideUnitValue {
  top: UnitValue
  right: UnitValue
  bottom: UnitValue
  left: UnitValue
}

export interface SideColorValue {
  top: string
  right: string
  bottom: string
  left: string
}

export interface CornerUnitValue {
  topLeft: UnitValue
  topRight: UnitValue
  bottomRight: UnitValue
  bottomLeft: UnitValue
}

interface BaseControl {
  id: string
  label: string
  prop: string
  valueScope?: 'prop' | 'style'
  mediaType?: 'image'
  helpText?: string
  disabled?: boolean
  coalesce?: boolean
}

export interface TextControl extends BaseControl {
  type: 'text'
  defaultValue?: string
  placeholder?: string
}

export interface TextareaControl extends BaseControl {
  type: 'textarea'
  defaultValue?: string
  placeholder?: string
}

export interface NumberControl extends BaseControl {
  type: 'number'
  defaultValue?: number
  min?: number
  max?: number
  step?: number
}

export interface SliderControl extends BaseControl {
  type: 'slider'
  defaultValue?: number
  min: number
  max: number
  step?: number
}

export interface SelectControl extends BaseControl {
  type: 'select'
  defaultValue?: string
  options: Array<{ label: string; value: string }>
}

export interface ToggleControl extends BaseControl {
  type: 'toggle'
  defaultValue?: boolean
}

export interface ColorControl extends BaseControl {
  type: 'color'
  defaultValue?: string
}

export interface UnitControl extends BaseControl {
  type: 'unit'
  defaultValue?: UnitValue
  min?: number
  max?: number
  step?: number
  units?: CssUnit[]
  tokenGroup?: TokenGroup
}

export interface SpacingControl extends BaseControl {
  type: 'spacing'
  defaultValue?: SpacingValue
  units?: CssUnit[]
}

export interface ShadowValue {
  offsetX: UnitValue
  offsetY: UnitValue
  blur: UnitValue
  spread: UnitValue
  color: string
  inset: boolean
}

export interface ShadowControl extends BaseControl {
  type: 'shadow'
  defaultValue?: ShadowValue
  tokenGroup?: TokenGroup
}

export interface UnitBoxControl extends BaseControl {
  type: 'unit-box'
  defaultValue?: SideUnitValue | CornerUnitValue
  min?: number
  max?: number
  step?: number
  units?: CssUnit[]
  mode: 'sides' | 'corners'
  tokenGroup?: TokenGroup
}

export interface ColorBoxControl extends BaseControl {
  type: 'color-box'
  defaultValue?: SideColorValue
  tokenGroup?: TokenGroup
}

export type KnownControl =
  | TextControl
  | TextareaControl
  | NumberControl
  | SliderControl
  | SelectControl
  | ToggleControl
  | ColorControl
  | UnitControl
  | SpacingControl
  | ShadowControl
  | UnitBoxControl
  | ColorBoxControl

export type ControlDefinition = KnownControl | (BaseControl & { type: string })

export interface ControlSectionSchema {
  id: string
  title: string
  controls: ControlDefinition[]
}

export interface ElementControlSchema {
  block?: ControlSectionSchema[]
  inspector?: ControlSectionSchema[]
}
