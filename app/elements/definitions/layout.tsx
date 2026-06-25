import React from 'react'
import type { ElementDefinition, ElementRenderProps } from '../types'
import { layoutInspectorSchema } from '@/inspector/style/styleSchemas'

function makeContainer(
  label: string,
  tag: keyof React.JSX.IntrinsicElements = 'div',
): React.ComponentType<ElementRenderProps> {
  function ContainerEl({ 'data-node-id': nodeId, children, style }: ElementRenderProps) {
    const Tag = tag as 'div'
    return (
      <Tag
        data-node-id={nodeId}
        style={{
          display: 'block',
          width: '100%',
          minHeight: 40,
          boxSizing: 'border-box',
          ...style,
        }}
      >
        {children}
      </Tag>
    )
  }
  ContainerEl.displayName = label
  return ContainerEl
}

function htmlIdBlock(type: string, title: string) {
  return [
    {
      id: `${type}-content`,
      title,
      controls: [
        {
          id: 'html-id',
          type: 'text' as const,
          label: 'HTML ID',
          prop: 'htmlId',
          placeholder: 'my-element',
        },
      ],
    },
  ]
}

function BodyElement({ 'data-node-id': nodeId, children, style }: ElementRenderProps) {
  return (
    <div
      data-node-id={nodeId}
      style={{
        display: 'block',
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export const bodyDefinition: ElementDefinition = {
  type: 'body',
  label: 'Body',
  icon: 'tabler:home',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: BodyElement,
  controlSchema: {
    block: htmlIdBlock('body', 'Body'),
    inspector: layoutInspectorSchema,
  },
}

export const divBlockDefinition: ElementDefinition = {
  type: 'div-block',
  label: 'Div Block',
  icon: 'tabler:square-rounded',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: makeContainer('Div Block'),
  controlSchema: {
    block: htmlIdBlock('div-block', 'Div Block'),
    inspector: layoutInspectorSchema,
  },
}

function GridElement({ 'data-node-id': nodeId, node, children, style }: ElementRenderProps) {
  const columns = (node.props['columns'] as number | undefined) ?? 3
  const gapPx = (node.props['gapPx'] as number | undefined) ?? 16
  return (
    <div
      data-node-id={nodeId}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gapPx}px`,
        width: '100%',
        minHeight: 40,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export const gridDefinition: ElementDefinition = {
  type: 'grid',
  label: 'Grid',
  icon: 'tabler:layout-grid',
  category: 'Layout',
  defaultProps: { columns: 3, gapPx: 16 },
  nesting: { acceptsChildren: true },
  render: GridElement,
  insertConfig: {
    title: 'Configure Grid',
    fields: [
      {
        id: 'columns',
        label: 'Columns',
        prop: 'columns',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 12,
      },
      { id: 'gapPx', label: 'Gap (px)', prop: 'gapPx', type: 'number', defaultValue: 16, min: 0 },
    ],
  },
  controlSchema: {
    block: [
      ...htmlIdBlock('grid', 'Grid'),
      {
        id: 'grid-config',
        title: 'Grid Configuration',
        controls: [
          {
            id: 'columns',
            type: 'number' as const,
            label: 'Columns',
            prop: 'columns',
            defaultValue: 3,
            min: 1,
            max: 12,
          },
          {
            id: 'gapPx',
            type: 'number' as const,
            label: 'Gap (px)',
            prop: 'gapPx',
            defaultValue: 16,
            min: 0,
          },
        ],
      },
    ],
    inspector: layoutInspectorSchema,
  },
}

function ColumnsElement({ 'data-node-id': nodeId, node, children, style }: ElementRenderProps) {
  const columns = (node.props['columns'] as number | undefined) ?? 2
  return (
    <div
      data-node-id={nodeId}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
        width: '100%',
        minHeight: 40,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export const columnsDefinition: ElementDefinition = {
  type: 'columns',
  label: 'Columns',
  icon: 'tabler:columns-2',
  category: 'Layout',
  defaultProps: { columns: 2 },
  nesting: { acceptsChildren: true },
  render: ColumnsElement,
  insertConfig: {
    title: 'Configure Columns',
    fields: [
      {
        id: 'columns',
        label: 'Column Count',
        prop: 'columns',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 6,
      },
    ],
  },
  controlSchema: {
    block: [
      ...htmlIdBlock('columns', 'Columns'),
      {
        id: 'columns-config',
        title: 'Column Configuration',
        controls: [
          {
            id: 'columns',
            type: 'number' as const,
            label: 'Columns',
            prop: 'columns',
            defaultValue: 2,
            min: 1,
            max: 6,
          },
        ],
      },
    ],
    inspector: layoutInspectorSchema,
  },
}

export const listDefinition: ElementDefinition = {
  type: 'list',
  label: 'List',
  icon: 'tabler:list',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true, allowedChildTypes: ['list-item'] },
  render: makeContainer('List', 'ul'),
  controlSchema: {
    block: htmlIdBlock('list', 'List'),
    inspector: layoutInspectorSchema,
  },
}

export const listItemDefinition: ElementDefinition = {
  type: 'list-item',
  label: 'List Item',
  icon: 'tabler:point',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: makeContainer('List Item', 'li'),
  controlSchema: {
    block: htmlIdBlock('list-item', 'List Item'),
    inspector: layoutInspectorSchema,
  },
}

export const linkBlockDefinition: ElementDefinition = {
  type: 'link-block',
  label: 'Link Block',
  icon: 'tabler:link',
  category: 'Layout',
  defaultProps: { href: '#' },
  nesting: { acceptsChildren: true },
  render: makeContainer('Link Block', 'a'),
  controlSchema: {
    block: [
      {
        id: 'link-block-content',
        title: 'Link Block',
        controls: [
          {
            id: 'href',
            type: 'text' as const,
            label: 'URL',
            prop: 'href',
            placeholder: 'https://',
          },
          {
            id: 'html-id',
            type: 'text' as const,
            label: 'HTML ID',
            prop: 'htmlId',
            placeholder: 'my-link',
          },
        ],
      },
    ],
    inspector: layoutInspectorSchema,
  },
}

function BlockquoteElement({ 'data-node-id': nodeId, node, style }: ElementRenderProps) {
  return (
    <blockquote
      data-node-id={nodeId}
      style={{
        margin: '0 0 1em',
        paddingLeft: '1em',
        borderLeft: '4px solid #e2e8f0',
        fontStyle: 'italic',
        color: '#64748b',
        ...style,
      }}
    >
      {(node.props['text'] as string | undefined) ?? 'Blockquote text'}
    </blockquote>
  )
}

export const blockquoteDefinition: ElementDefinition = {
  type: 'blockquote',
  label: 'Blockquote',
  icon: 'tabler:blockquote',
  category: 'Layout',
  defaultProps: { text: 'Blockquote text' },
  nesting: { acceptsChildren: false },
  render: BlockquoteElement,
  controlSchema: {
    block: [
      {
        id: 'blockquote-content',
        title: 'Blockquote',
        controls: [
          {
            id: 'text',
            type: 'textarea' as const,
            label: 'Text',
            prop: 'text',
            defaultValue: 'Blockquote text',
          },
        ],
      },
    ],
    inspector: layoutInspectorSchema,
  },
}

export const componentDefinition: ElementDefinition = {
  type: 'component',
  label: 'Component',
  icon: 'tabler:components',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: makeContainer('Component'),
  controlSchema: {
    block: htmlIdBlock('component', 'Component'),
    inspector: layoutInspectorSchema,
  },
}

export const slotDefinition: ElementDefinition = {
  type: 'slot',
  label: 'Slot',
  icon: 'tabler:layout-sidebar-right-expand',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: makeContainer('Slot'),
  controlSchema: {
    block: htmlIdBlock('slot', 'Slot'),
    inspector: layoutInspectorSchema,
  },
}
