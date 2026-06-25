import type { ElementDefinition, ElementRenderProps } from '../types'

function makeContainer(
  label: string,
  tag: keyof React.JSX.IntrinsicElements = 'div',
): React.ComponentType<ElementRenderProps> {
  function ContainerEl({ 'data-node-id': nodeId, children }: ElementRenderProps) {
    const Tag = tag as 'div'
    return (
      <Tag
        data-node-id={nodeId}
        style={{ display: 'block', width: '100%', minHeight: 40, boxSizing: 'border-box' }}
      >
        {children}
      </Tag>
    )
  }
  ContainerEl.displayName = label
  return ContainerEl
}

function makeLeaf(label: string): React.ComponentType<ElementRenderProps> {
  function LeafEl({ 'data-node-id': nodeId }: ElementRenderProps) {
    return (
      <div
        data-node-id={nodeId}
        style={{
          display: 'inline-block',
          padding: '2px 6px',
          border: '1px dashed #94a3b8',
          borderRadius: 3,
          color: '#94a3b8',
          fontSize: 11,
        }}
      >
        {label}
      </div>
    )
  }
  LeafEl.displayName = label
  return LeafEl
}

import React from 'react'

function BodyElement({ 'data-node-id': nodeId, children }: ElementRenderProps) {
  return (
    <div
      data-node-id={nodeId}
      style={{ display: 'block', width: '100%', minHeight: '100vh', boxSizing: 'border-box' }}
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
}

export const divBlockDefinition: ElementDefinition = {
  type: 'div-block',
  label: 'Div Block',
  icon: 'tabler:square-rounded',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: makeContainer('Div Block'),
}

export const gridDefinition: ElementDefinition = {
  type: 'grid',
  label: 'Grid',
  icon: 'tabler:layout-grid',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: makeContainer('Grid'),
}

export const columnsDefinition: ElementDefinition = {
  type: 'columns',
  label: 'Columns',
  icon: 'tabler:columns-2',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: makeContainer('Columns'),
}

export const listDefinition: ElementDefinition = {
  type: 'list',
  label: 'List',
  icon: 'tabler:list',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true, allowedChildTypes: ['list-item'] },
  render: makeContainer('List', 'ul'),
}

export const listItemDefinition: ElementDefinition = {
  type: 'list-item',
  label: 'List Item',
  icon: 'tabler:point',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: makeContainer('List Item', 'li'),
}

export const linkBlockDefinition: ElementDefinition = {
  type: 'link-block',
  label: 'Link Block',
  icon: 'tabler:link',
  category: 'Layout',
  defaultProps: { href: '#' },
  nesting: { acceptsChildren: true },
  render: makeContainer('Link Block', 'a'),
}

export const blockquoteDefinition: ElementDefinition = {
  type: 'blockquote',
  label: 'Blockquote',
  icon: 'tabler:blockquote',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: false },
  render: makeLeaf('Blockquote'),
}

export const componentDefinition: ElementDefinition = {
  type: 'component',
  label: 'Component',
  icon: 'tabler:components',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: makeContainer('Component'),
}

export const slotDefinition: ElementDefinition = {
  type: 'slot',
  label: 'Slot',
  icon: 'tabler:layout-sidebar-right-expand',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: makeContainer('Slot'),
}
