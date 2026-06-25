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

export const buttonDefinition: ElementDefinition = {
  type: 'button',
  label: 'Button',
  icon: 'tabler:hand-click',
  category: 'Basic',
  defaultProps: { label: 'Click me' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Button'),
}

export const textLinkDefinition: ElementDefinition = {
  type: 'text-link',
  label: 'Text Link',
  icon: 'tabler:link',
  category: 'Basic',
  defaultProps: { href: '#', label: 'Link' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Text Link'),
}

export const imageDefinition: ElementDefinition = {
  type: 'image',
  label: 'Image',
  icon: 'tabler:photo',
  category: 'Basic',
  defaultProps: { src: '', alt: '' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Image'),
}

export const videoDefinition: ElementDefinition = {
  type: 'video',
  label: 'Video',
  icon: 'tabler:video',
  category: 'Basic',
  defaultProps: { src: '' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Video'),
}

export const youtubeVideoDefinition: ElementDefinition = {
  type: 'youtube-video',
  label: 'YouTube Video',
  icon: 'tabler:brand-youtube',
  category: 'Basic',
  defaultProps: { videoId: '' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('YouTube Video'),
}

export const lottieDefinition: ElementDefinition = {
  type: 'lottie',
  label: 'Lottie',
  icon: 'tabler:sparkles',
  category: 'Basic',
  defaultProps: { src: '' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Lottie'),
}

export const htmlEmbedDefinition: ElementDefinition = {
  type: 'html-embed',
  label: 'HTML Embed',
  icon: 'tabler:code',
  category: 'Basic',
  defaultProps: { html: '' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('HTML Embed'),
}

export const dividerDefinition: ElementDefinition = {
  type: 'divider',
  label: 'Divider',
  icon: 'tabler:separator-horizontal',
  category: 'Basic',
  defaultProps: {},
  nesting: { acceptsChildren: false },
  render: function DividerElement({ 'data-node-id': nodeId }: ElementRenderProps) {
    return (
      <hr
        data-node-id={nodeId}
        style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }}
      />
    )
  },
}

export const spacerDefinition: ElementDefinition = {
  type: 'spacer',
  label: 'Spacer',
  icon: 'tabler:space',
  category: 'Basic',
  defaultProps: { height: 40 },
  nesting: { acceptsChildren: false },
  render: function SpacerElement({ 'data-node-id': nodeId, node }: ElementRenderProps) {
    const h = (node.props['height'] as number | undefined) ?? 40
    return <div data-node-id={nodeId} style={{ height: h, display: 'block' }} />
  },
}

export const embedDefinition: ElementDefinition = {
  type: 'embed',
  label: 'Embed',
  icon: 'tabler:brackets',
  category: 'Basic',
  defaultProps: { src: '' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Embed'),
}
