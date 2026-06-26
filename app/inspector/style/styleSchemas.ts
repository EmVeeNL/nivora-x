import type {
  ControlSectionSchema,
  ShadowValue,
  SideColorValue,
  SideUnitValue,
  CornerUnitValue,
} from '@/inspector/controls/types'
import {
  cornerUnitValue,
  sideColorValue,
  sideUnitValue,
  spacingValue,
  unitValue,
} from '@/inspector/controls/valueUnits'
import { SYSTEM_FONT_OPTIONS } from './fontFamilies'

const DEFAULT_SHADOW: ShadowValue = {
  offsetX: unitValue(0),
  offsetY: unitValue(4),
  blur: unitValue(12),
  spread: unitValue(0),
  color: 'rgba(0,0,0,0.2)',
  inset: false,
}

const DEFAULT_BORDER_WIDTH: SideUnitValue = sideUnitValue(unitValue(1))
const DEFAULT_BORDER_COLOR: SideColorValue = sideColorValue('#000000')
const DEFAULT_BORDER_RADIUS: CornerUnitValue = cornerUnitValue(unitValue(0))

function styleSection(section: ControlSectionSchema): ControlSectionSchema {
  return {
    ...section,
    controls: section.controls.map((control) => ({ ...control, valueScope: 'style' })),
  }
}

export const layoutStyleSection: ControlSectionSchema = styleSection({
  id: 'layout',
  title: 'Layout',
  controls: [
    {
      id: 'display',
      type: 'select',
      label: 'Display',
      prop: 'display',
      defaultValue: 'block',
      options: [
        { label: 'Block', value: 'block' },
        { label: 'Flex', value: 'flex' },
        { label: 'Grid', value: 'grid' },
        { label: 'Inline Block', value: 'inline-block' },
      ],
    },
    {
      id: 'flex-direction',
      type: 'select',
      label: 'Direction',
      prop: 'flexDirection',
      defaultValue: 'row',
      options: [
        { label: 'Row', value: 'row' },
        { label: 'Column', value: 'column' },
        { label: 'Row Reverse', value: 'row-reverse' },
        { label: 'Column Reverse', value: 'column-reverse' },
      ],
    },
    {
      id: 'align-items',
      type: 'select',
      label: 'Align',
      prop: 'alignItems',
      defaultValue: 'stretch',
      options: [
        { label: 'Stretch', value: 'stretch' },
        { label: 'Start', value: 'flex-start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'flex-end' },
      ],
    },
    {
      id: 'justify-content',
      type: 'select',
      label: 'Justify',
      prop: 'justifyContent',
      defaultValue: 'flex-start',
      options: [
        { label: 'Start', value: 'flex-start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'flex-end' },
        { label: 'Space Between', value: 'space-between' },
      ],
    },
    {
      id: 'gap',
      type: 'unit',
      label: 'Gap',
      prop: 'gap',
      defaultValue: unitValue(0),
      min: 0,
      coalesce: true,
    },
  ],
})

export const spacingStyleSection: ControlSectionSchema = styleSection({
  id: 'spacing',
  title: 'Spacing',
  controls: [
    {
      id: 'margin',
      type: 'spacing',
      label: 'Margin',
      prop: 'margin',
      defaultValue: spacingValue(unitValue(0)),
      coalesce: true,
    },
    {
      id: 'padding',
      type: 'spacing',
      label: 'Padding',
      prop: 'padding',
      defaultValue: spacingValue(unitValue(0)),
      coalesce: true,
    },
  ],
})

export const sizeStyleSection: ControlSectionSchema = styleSection({
  id: 'size',
  title: 'Size',
  controls: [
    { id: 'width', type: 'unit', label: 'Width', prop: 'width', defaultValue: unitValue(100, '%') },
    { id: 'height', type: 'unit', label: 'Height', prop: 'height', defaultValue: unitValue(0) },
    {
      id: 'min-height',
      type: 'unit',
      label: 'Min Height',
      prop: 'minHeight',
      defaultValue: unitValue(0),
    },
    {
      id: 'max-width',
      type: 'unit',
      label: 'Max Width',
      prop: 'maxWidth',
      defaultValue: unitValue(1200),
    },
  ],
})

export const typographyStyleSection: ControlSectionSchema = styleSection({
  id: 'typography',
  title: 'Typography',
  controls: [
    {
      id: 'font-family',
      type: 'select',
      label: 'Font Family',
      prop: 'fontFamily',
      defaultValue: 'system-ui',
      options: SYSTEM_FONT_OPTIONS,
    },
    {
      id: 'font-size',
      type: 'unit',
      label: 'Font Size',
      prop: 'fontSize',
      defaultValue: unitValue(16),
      min: 1,
      coalesce: true,
    },
    {
      id: 'font-weight',
      type: 'select',
      label: 'Font Weight',
      prop: 'fontWeight',
      defaultValue: '400',
      options: [
        { label: 'Regular', value: '400' },
        { label: 'Medium', value: '500' },
        { label: 'Semi Bold', value: '600' },
        { label: 'Bold', value: '700' },
      ],
    },
    {
      id: 'line-height',
      type: 'number',
      label: 'Line Height',
      prop: 'lineHeight',
      defaultValue: 1.5,
      min: 0.8,
      max: 3,
      step: 0.1,
      coalesce: true,
    },
    { id: 'color', type: 'color', label: 'Color', prop: 'color', defaultValue: '#111827' },
  ],
})

export const backgroundStyleSection: ControlSectionSchema = styleSection({
  id: 'background',
  title: 'Background',
  controls: [
    {
      id: 'background-color',
      type: 'color',
      label: 'Color',
      prop: 'backgroundColor',
      defaultValue: '',
    },
    {
      id: 'background-image',
      type: 'textarea',
      label: 'Image / Gradient',
      prop: 'backgroundImage',
      mediaType: 'image',
      defaultValue: '',
      placeholder: 'https://... or linear-gradient(...)',
    },
    {
      id: 'background-position',
      type: 'select',
      label: 'Position',
      prop: 'backgroundPosition',
      defaultValue: 'center center',
      options: [
        { label: 'Center', value: 'center center' },
        { label: 'Top Left', value: 'left top' },
        { label: 'Top Center', value: 'center top' },
        { label: 'Top Right', value: 'right top' },
        { label: 'Center Left', value: 'left center' },
        { label: 'Center Right', value: 'right center' },
        { label: 'Bottom Left', value: 'left bottom' },
        { label: 'Bottom Center', value: 'center bottom' },
        { label: 'Bottom Right', value: 'right bottom' },
      ],
    },
    {
      id: 'background-size',
      type: 'select',
      label: 'Size',
      prop: 'backgroundSize',
      defaultValue: 'cover',
      options: [
        { label: 'Cover', value: 'cover' },
        { label: 'Contain', value: 'contain' },
        { label: 'Auto', value: 'auto' },
      ],
    },
    {
      id: 'background-repeat',
      type: 'select',
      label: 'Repeat',
      prop: 'backgroundRepeat',
      defaultValue: 'no-repeat',
      options: [
        { label: 'No Repeat', value: 'no-repeat' },
        { label: 'Repeat', value: 'repeat' },
        { label: 'Repeat X', value: 'repeat-x' },
        { label: 'Repeat Y', value: 'repeat-y' },
      ],
    },
  ],
})

export const borderStyleSection: ControlSectionSchema = styleSection({
  id: 'border',
  title: 'Border',
  controls: [
    {
      id: 'border-style',
      type: 'select',
      label: 'Style',
      prop: 'borderStyle',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Solid', value: 'solid' },
        { label: 'Dashed', value: 'dashed' },
        { label: 'Dotted', value: 'dotted' },
        { label: 'Double', value: 'double' },
      ],
    },
    {
      id: 'border-width',
      type: 'unit-box',
      label: 'Width',
      prop: 'borderWidth',
      defaultValue: DEFAULT_BORDER_WIDTH,
      min: 0,
      mode: 'sides',
      coalesce: true,
    },
    {
      id: 'border-color',
      type: 'color-box',
      label: 'Color',
      prop: 'borderColor',
      defaultValue: DEFAULT_BORDER_COLOR,
      tokenGroup: 'color',
    },
    {
      id: 'border-radius',
      type: 'unit-box',
      label: 'Radius',
      prop: 'borderRadius',
      defaultValue: DEFAULT_BORDER_RADIUS,
      min: 0,
      mode: 'corners',
      tokenGroup: 'effect',
      coalesce: true,
    },
  ],
})

export const shadowStyleSection: ControlSectionSchema = styleSection({
  id: 'shadow',
  title: 'Shadow',
  controls: [
    {
      id: 'box-shadow',
      type: 'shadow',
      label: 'Box Shadow',
      prop: 'boxShadow',
      defaultValue: DEFAULT_SHADOW,
      tokenGroup: 'effect',
    },
  ],
})

export const visibilityStyleSection: ControlSectionSchema = styleSection({
  id: 'visibility',
  title: 'Visibility',
  controls: [
    {
      id: 'hidden',
      type: 'toggle',
      label: 'Hidden',
      prop: 'hidden',
      defaultValue: false,
    },
  ],
})

export const layoutInspectorSchema: ControlSectionSchema[] = [
  layoutStyleSection,
  spacingStyleSection,
  sizeStyleSection,
  backgroundStyleSection,
  borderStyleSection,
  shadowStyleSection,
  visibilityStyleSection,
]

export const textInspectorSchema: ControlSectionSchema[] = [
  spacingStyleSection,
  sizeStyleSection,
  typographyStyleSection,
  backgroundStyleSection,
  borderStyleSection,
  shadowStyleSection,
  visibilityStyleSection,
]

/** Minimal inspector for non-text leaf elements (images, embeds, etc.) */
export const basicInspectorSchema: ControlSectionSchema[] = [
  spacingStyleSection,
  sizeStyleSection,
  backgroundStyleSection,
  borderStyleSection,
  shadowStyleSection,
  visibilityStyleSection,
]
