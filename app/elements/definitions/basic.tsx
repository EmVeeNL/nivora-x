import React from 'react'
import type { ElementDefinition, ElementRenderProps } from '../types'
import { textInspectorSchema, basicInspectorSchema } from '@/inspector/style/styleSchemas'

export const buttonDefinition: ElementDefinition = {
  type: 'button',
  label: 'Button',
  icon: 'tabler:hand-click',
  category: 'Basic',
  defaultProps: { label: 'Click me' },
  nesting: { acceptsChildren: false },
  render: function ButtonElement({ 'data-node-id': nodeId, node, style }: ElementRenderProps) {
    return (
      <button
        type="button"
        data-node-id={nodeId}
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontSize: 14,
          cursor: 'pointer',
          ...style,
        }}
      >
        {(node.props['label'] as string | undefined) ?? 'Click me'}
      </button>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'button-content',
        title: 'Button',
        controls: [
          { id: 'label', type: 'text', label: 'Label', prop: 'label', defaultValue: 'Click me' },
          { id: 'href', type: 'text', label: 'URL', prop: 'href', placeholder: 'https://' },
        ],
      },
    ],
    inspector: textInspectorSchema,
  },
}

export const textLinkDefinition: ElementDefinition = {
  type: 'text-link',
  label: 'Text Link',
  icon: 'tabler:link',
  category: 'Basic',
  defaultProps: { href: '#', label: 'Link' },
  nesting: { acceptsChildren: false },
  render: function TextLinkElement({ 'data-node-id': nodeId, node, style }: ElementRenderProps) {
    return (
      <a
        data-node-id={nodeId}
        href={(node.props['href'] as string | undefined) ?? '#'}
        style={{ color: '#3b82f6', textDecoration: 'underline', ...style }}
      >
        {(node.props['label'] as string | undefined) ?? 'Link'}
      </a>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'text-link-content',
        title: 'Text Link',
        controls: [
          { id: 'label', type: 'text', label: 'Label', prop: 'label', defaultValue: 'Link' },
          { id: 'href', type: 'text', label: 'URL', prop: 'href', placeholder: 'https://' },
        ],
      },
    ],
    inspector: textInspectorSchema,
  },
}

export const imageDefinition: ElementDefinition = {
  type: 'image',
  label: 'Image',
  icon: 'tabler:photo',
  category: 'Basic',
  defaultProps: { src: '', alt: '' },
  nesting: { acceptsChildren: false },
  render: function ImageElement({ 'data-node-id': nodeId, node, style }: ElementRenderProps) {
    const src = (node.props['src'] as string | undefined) ?? ''
    return src ? (
      <img
        data-node-id={nodeId}
        src={src}
        alt={(node.props['alt'] as string | undefined) ?? ''}
        style={{ display: 'block', maxWidth: '100%', ...style }}
      />
    ) : (
      <div
        data-node-id={nodeId}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 80,
          background: '#f1f5f9',
          border: '1px dashed #94a3b8',
          borderRadius: 4,
          color: '#94a3b8',
          fontSize: 12,
          ...style,
        }}
      >
        Image
      </div>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'image-content',
        title: 'Image',
        controls: [
          { id: 'src', type: 'text', label: 'Source URL', prop: 'src', placeholder: 'https://...' },
          {
            id: 'alt',
            type: 'text',
            label: 'Alt Text',
            prop: 'alt',
            placeholder: 'Describe the image',
          },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

function MediaLeaf(label: string) {
  return function LeafEl({ 'data-node-id': nodeId, style }: ElementRenderProps) {
    return (
      <div
        data-node-id={nodeId}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 60,
          background: '#f1f5f9',
          border: '1px dashed #94a3b8',
          borderRadius: 4,
          color: '#94a3b8',
          fontSize: 12,
          ...style,
        }}
      >
        {label}
      </div>
    )
  }
}

export const videoDefinition: ElementDefinition = {
  type: 'video',
  label: 'Video',
  icon: 'tabler:video',
  category: 'Basic',
  defaultProps: { src: '' },
  nesting: { acceptsChildren: false },
  render: MediaLeaf('Video'),
  controlSchema: {
    block: [
      {
        id: 'video-content',
        title: 'Video',
        controls: [
          { id: 'src', type: 'text', label: 'Source URL', prop: 'src', placeholder: 'https://...' },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const youtubeVideoDefinition: ElementDefinition = {
  type: 'youtube-video',
  label: 'YouTube Video',
  icon: 'tabler:brand-youtube',
  category: 'Basic',
  defaultProps: { videoId: '' },
  nesting: { acceptsChildren: false },
  render: MediaLeaf('YouTube Video'),
  controlSchema: {
    block: [
      {
        id: 'youtube-video-content',
        title: 'YouTube Video',
        controls: [
          {
            id: 'video-id',
            type: 'text',
            label: 'Video ID',
            prop: 'videoId',
            placeholder: 'dQw4w9WgXcQ',
          },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const lottieDefinition: ElementDefinition = {
  type: 'lottie',
  label: 'Lottie',
  icon: 'tabler:sparkles',
  category: 'Basic',
  defaultProps: { src: '' },
  nesting: { acceptsChildren: false },
  render: MediaLeaf('Lottie'),
  controlSchema: {
    block: [
      {
        id: 'lottie-content',
        title: 'Lottie',
        controls: [
          { id: 'src', type: 'text', label: 'JSON URL', prop: 'src', placeholder: 'https://...' },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const htmlEmbedDefinition: ElementDefinition = {
  type: 'html-embed',
  label: 'HTML Embed',
  icon: 'tabler:code',
  category: 'Basic',
  defaultProps: { html: '' },
  nesting: { acceptsChildren: false },
  render: function HtmlEmbedElement({ 'data-node-id': nodeId, node, style }: ElementRenderProps) {
    const html = (node.props['html'] as string | undefined) ?? ''
    return (
      <div
        data-node-id={nodeId}
        style={style}
        dangerouslySetInnerHTML={html ? { __html: html } : undefined}
      >
        {!html && (
          <div
            style={{
              padding: '8px 12px',
              border: '1px dashed #94a3b8',
              borderRadius: 3,
              color: '#94a3b8',
              fontSize: 11,
            }}
          >
            HTML Embed
          </div>
        )}
      </div>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'html-embed-content',
        title: 'HTML Embed',
        controls: [
          { id: 'html', type: 'textarea', label: 'HTML Code', prop: 'html', defaultValue: '' },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const dividerDefinition: ElementDefinition = {
  type: 'divider',
  label: 'Divider',
  icon: 'tabler:separator-horizontal',
  category: 'Basic',
  defaultProps: {},
  nesting: { acceptsChildren: false },
  render: function DividerElement({ 'data-node-id': nodeId, style }: ElementRenderProps) {
    return (
      <hr
        data-node-id={nodeId}
        style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0', ...style }}
      />
    )
  },
  controlSchema: {
    block: [],
    inspector: basicInspectorSchema,
  },
}

export const spacerDefinition: ElementDefinition = {
  type: 'spacer',
  label: 'Spacer',
  icon: 'tabler:space',
  category: 'Basic',
  defaultProps: { height: 40 },
  nesting: { acceptsChildren: false },
  render: function SpacerElement({ 'data-node-id': nodeId, node, style }: ElementRenderProps) {
    const h = (node.props['height'] as number | undefined) ?? 40
    return <div data-node-id={nodeId} style={{ height: h, display: 'block', ...style }} />
  },
  controlSchema: {
    block: [
      {
        id: 'spacer-content',
        title: 'Spacer',
        controls: [
          {
            id: 'height',
            type: 'number',
            label: 'Height (px)',
            prop: 'height',
            defaultValue: 40,
            min: 0,
          },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const embedDefinition: ElementDefinition = {
  type: 'embed',
  label: 'Embed',
  icon: 'tabler:brackets',
  category: 'Basic',
  defaultProps: { src: '' },
  nesting: { acceptsChildren: false },
  render: MediaLeaf('Embed'),
  controlSchema: {
    block: [
      {
        id: 'embed-content',
        title: 'Embed',
        controls: [
          { id: 'src', type: 'text', label: 'URL', prop: 'src', placeholder: 'https://...' },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}
