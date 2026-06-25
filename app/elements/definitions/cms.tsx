import React from 'react'
import type { ElementDefinition, ElementRenderProps } from '../types'

function makeLeaf(label: string): React.ComponentType<ElementRenderProps> {
  function LeafEl({ 'data-node-id': nodeId }: ElementRenderProps) {
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
  render: function CollectionListElement({ 'data-node-id': nodeId, children }: ElementRenderProps) {
    return (
      <div
        data-node-id={nodeId}
        style={{ display: 'block', border: '1px dashed #94a3b8', borderRadius: 4, minHeight: 60 }}
      >
        {children}
      </div>
    )
  },
}

export const collectionItemDefinition: ElementDefinition = {
  type: 'collection-item',
  label: 'Collection Item',
  icon: 'tabler:file-database',
  category: 'CMS',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function CollectionItemElement({ 'data-node-id': nodeId, children }: ElementRenderProps) {
    return (
      <div data-node-id={nodeId} style={{ display: 'block', padding: 8 }}>
        {children}
      </div>
    )
  },
}

export const collectionPageDefinition: ElementDefinition = {
  type: 'collection-page',
  label: 'Collection Page',
  icon: 'tabler:database-export',
  category: 'CMS',
  defaultProps: {},
  nesting: { acceptsChildren: false },
  render: makeLeaf('Collection Page'),
}
