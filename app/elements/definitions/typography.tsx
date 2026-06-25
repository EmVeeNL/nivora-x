import React from 'react'
import type { ElementDefinition, ElementRenderProps } from '../types'
import { textInspectorSchema, basicInspectorSchema } from '@/inspector/style/styleSchemas'

export const paragraphDefinition: ElementDefinition = {
  type: 'paragraph',
  label: 'Paragraph',
  icon: 'tabler:pilcrow',
  category: 'Typography',
  defaultProps: { text: 'Paragraph text' },
  nesting: { acceptsChildren: false },
  render: function ParagraphElement({ 'data-node-id': nodeId, node, style }: ElementRenderProps) {
    return (
      <p data-node-id={nodeId} style={{ margin: '0 0 16px', ...style }}>
        {(node.props['text'] as string | undefined) ?? 'Paragraph text'}
      </p>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'paragraph-content',
        title: 'Paragraph',
        controls: [
          {
            id: 'text',
            type: 'textarea',
            label: 'Text',
            prop: 'text',
            defaultValue: 'Paragraph text',
          },
        ],
      },
    ],
    inspector: textInspectorSchema,
  },
}

export const richTextDefinition: ElementDefinition = {
  type: 'rich-text',
  label: 'Rich Text',
  icon: 'tabler:article',
  category: 'Typography',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function RichTextElement({
    'data-node-id': nodeId,
    children,
    style,
  }: ElementRenderProps) {
    return (
      <div data-node-id={nodeId} style={{ lineHeight: 1.6, ...style }}>
        {children}
      </div>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'rich-text-content',
        title: 'Rich Text',
        controls: [
          {
            id: 'html-id',
            type: 'text',
            label: 'HTML ID',
            prop: 'htmlId',
            placeholder: 'my-rich-text',
          },
        ],
      },
    ],
    inspector: textInspectorSchema,
  },
}

export const textSpanDefinition: ElementDefinition = {
  type: 'text-span',
  label: 'Text Span',
  icon: 'tabler:letter-case',
  category: 'Typography',
  defaultProps: { text: 'span' },
  nesting: { acceptsChildren: false },
  render: function TextSpanElement({ 'data-node-id': nodeId, node, style }: ElementRenderProps) {
    return (
      <span data-node-id={nodeId} style={style}>
        {(node.props['text'] as string | undefined) ?? 'span'}
      </span>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'text-span-content',
        title: 'Text Span',
        controls: [{ id: 'text', type: 'text', label: 'Text', prop: 'text', defaultValue: 'span' }],
      },
    ],
    inspector: textInspectorSchema,
  },
}

export const orderedListDefinition: ElementDefinition = {
  type: 'ordered-list',
  label: 'Ordered List',
  icon: 'tabler:list-numbers',
  category: 'Typography',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function OrderedListElement({
    'data-node-id': nodeId,
    children,
    style,
  }: ElementRenderProps) {
    return (
      <ol data-node-id={nodeId} style={{ paddingLeft: 20, margin: '0 0 16px', ...style }}>
        {children}
      </ol>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'ordered-list-content',
        title: 'Ordered List',
        controls: [
          { id: 'html-id', type: 'text', label: 'HTML ID', prop: 'htmlId', placeholder: 'my-list' },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const unorderedListDefinition: ElementDefinition = {
  type: 'unordered-list',
  label: 'Unordered List',
  icon: 'tabler:list',
  category: 'Typography',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function UnorderedListElement({
    'data-node-id': nodeId,
    children,
    style,
  }: ElementRenderProps) {
    return (
      <ul data-node-id={nodeId} style={{ paddingLeft: 20, margin: '0 0 16px', ...style }}>
        {children}
      </ul>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'unordered-list-content',
        title: 'Unordered List',
        controls: [
          { id: 'html-id', type: 'text', label: 'HTML ID', prop: 'htmlId', placeholder: 'my-list' },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}
