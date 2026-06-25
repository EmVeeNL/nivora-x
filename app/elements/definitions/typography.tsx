import React from 'react'
import type { ElementDefinition, ElementRenderProps } from '../types'

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

export const paragraphDefinition: ElementDefinition = {
  type: 'paragraph',
  label: 'Paragraph',
  icon: 'tabler:pilcrow',
  category: 'Typography',
  defaultProps: { text: 'Paragraph text' },
  nesting: { acceptsChildren: false },
  render: function ParagraphElement({ 'data-node-id': nodeId, node }: ElementRenderProps) {
    return (
      <p data-node-id={nodeId} style={{ margin: '0 0 16px' }}>
        {(node.props['text'] as string | undefined) ?? 'Paragraph text'}
      </p>
    )
  },
}

export const richTextDefinition: ElementDefinition = {
  type: 'rich-text',
  label: 'Rich Text',
  icon: 'tabler:article',
  category: 'Typography',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function RichTextElement({ 'data-node-id': nodeId, children }: ElementRenderProps) {
    return (
      <div data-node-id={nodeId} style={{ lineHeight: 1.6 }}>
        {children}
      </div>
    )
  },
}

export const textSpanDefinition: ElementDefinition = {
  type: 'text-span',
  label: 'Text Span',
  icon: 'tabler:letter-case',
  category: 'Typography',
  defaultProps: { text: 'span' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Text Span'),
}

export const orderedListDefinition: ElementDefinition = {
  type: 'ordered-list',
  label: 'Ordered List',
  icon: 'tabler:list-numbers',
  category: 'Typography',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function OrderedListElement({ 'data-node-id': nodeId, children }: ElementRenderProps) {
    return (
      <ol data-node-id={nodeId} style={{ paddingLeft: 20, margin: '0 0 16px' }}>
        {children}
      </ol>
    )
  },
}

export const unorderedListDefinition: ElementDefinition = {
  type: 'unordered-list',
  label: 'Unordered List',
  icon: 'tabler:list',
  category: 'Typography',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function UnorderedListElement({ 'data-node-id': nodeId, children }: ElementRenderProps) {
    return (
      <ul data-node-id={nodeId} style={{ paddingLeft: 20, margin: '0 0 16px' }}>
        {children}
      </ul>
    )
  },
}
