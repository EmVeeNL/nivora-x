import React from 'react'
import type { ElementDefinition, ElementRenderProps } from '../types'
import { basicInspectorSchema } from '@/inspector/style/styleSchemas'

function CmsLeaf(label: string): React.ComponentType<ElementRenderProps> {
  function LeafEl({ 'data-node-id': nodeId, style }: ElementRenderProps) {
    return (
      <div
        data-node-id={nodeId}
        style={{
          display: 'block',
          padding: '8px 12px',
          border: '1px dashed #94a3b8',
          borderRadius: 4,
          color: '#94a3b8',
          fontSize: 11,
          ...style,
        }}
      >
        {label}
      </div>
    )
  }
  LeafEl.displayName = label
  return LeafEl
}

export const collectionListDefinition: ElementDefinition = {
  type: 'collection-list',
  label: 'Collection List',
  icon: 'tabler:database',
  category: 'CMS',
  defaultProps: { collection: '' },
  nesting: { acceptsChildren: true },
  render: function CollectionListElement({
    'data-node-id': nodeId,
    children,
    style,
  }: ElementRenderProps) {
    return (
      <div
        data-node-id={nodeId}
        style={{
          display: 'block',
          border: '1px dashed #94a3b8',
          borderRadius: 4,
          minHeight: 60,
          ...style,
        }}
      >
        {children}
      </div>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'collection-list-content',
        title: 'Collection List',
        controls: [
          {
            id: 'collection',
            type: 'text',
            label: 'Collection slug',
            prop: 'collection',
            placeholder: 'posts',
          },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const collectionItemDefinition: ElementDefinition = {
  type: 'collection-item',
  label: 'Collection Item',
  icon: 'tabler:file-database',
  category: 'CMS',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function CollectionItemElement({
    'data-node-id': nodeId,
    children,
    style,
  }: ElementRenderProps) {
    return (
      <div data-node-id={nodeId} style={{ display: 'block', padding: 8, ...style }}>
        {children}
      </div>
    )
  },
  controlSchema: { block: [], inspector: basicInspectorSchema },
}

export const collectionPageDefinition: ElementDefinition = {
  type: 'collection-page',
  label: 'Collection Page',
  icon: 'tabler:database-export',
  category: 'CMS',
  defaultProps: {},
  nesting: { acceptsChildren: false },
  render: CmsLeaf('Collection Page'),
  controlSchema: { block: [], inspector: basicInspectorSchema },
}
