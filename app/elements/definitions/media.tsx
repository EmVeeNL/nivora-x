import React from 'react'
import type { ElementDefinition, ElementRenderProps } from '../types'

function makeLeaf(label: string): React.ComponentType<ElementRenderProps> {
  function LeafEl({ 'data-node-id': nodeId }: ElementRenderProps) {
    return (
      <div
        data-node-id={nodeId}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 12px',
          border: '1px dashed #94a3b8',
          borderRadius: 4,
          color: '#94a3b8',
          fontSize: 11,
          minHeight: 60,
        }}
      >
        {label}
      </div>
    )
  }
  LeafEl.displayName = label
  return LeafEl
}

export const mediaImageDefinition: ElementDefinition = {
  type: 'media-image',
  label: 'Image',
  icon: 'tabler:photo',
  category: 'Media',
  defaultProps: { src: '', alt: '' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Image'),
}

export const backgroundVideoDefinition: ElementDefinition = {
  type: 'background-video',
  label: 'Background Video',
  icon: 'tabler:video-plus',
  category: 'Media',
  defaultProps: { src: '' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Background Video'),
}

export const lightboxDefinition: ElementDefinition = {
  type: 'lightbox',
  label: 'Lightbox',
  icon: 'tabler:zoom-in',
  category: 'Media',
  defaultProps: {},
  nesting: { acceptsChildren: false },
  render: makeLeaf('Lightbox'),
}

export const mapDefinition: ElementDefinition = {
  type: 'map',
  label: 'Map',
  icon: 'tabler:map-pin',
  category: 'Media',
  defaultProps: { address: '' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Map'),
}

export const sliderDefinition: ElementDefinition = {
  type: 'slider',
  label: 'Slider',
  icon: 'tabler:carousel-horizontal',
  category: 'Media',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function SliderElement({ 'data-node-id': nodeId, children }: ElementRenderProps) {
    return (
      <div
        data-node-id={nodeId}
        style={{
          display: 'block',
          border: '1px dashed #94a3b8',
          borderRadius: 4,
          minHeight: 80,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    )
  },
}

export const tabsDefinition: ElementDefinition = {
  type: 'tabs',
  label: 'Tabs',
  icon: 'tabler:table',
  category: 'Media',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function TabsElement({ 'data-node-id': nodeId, children }: ElementRenderProps) {
    return (
      <div data-node-id={nodeId} style={{ display: 'block', minHeight: 60 }}>
        {children}
      </div>
    )
  },
}
