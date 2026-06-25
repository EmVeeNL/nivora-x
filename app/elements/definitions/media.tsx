import React from 'react'
import type { ElementDefinition, ElementRenderProps } from '../types'
import { basicInspectorSchema } from '@/inspector/style/styleSchemas'

function MediaLeaf(label: string): React.ComponentType<ElementRenderProps> {
  function LeafEl({ 'data-node-id': nodeId, style }: ElementRenderProps) {
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

export const mediaImageDefinition: ElementDefinition = {
  type: 'media-image',
  label: 'Image',
  icon: 'tabler:photo',
  category: 'Media',
  defaultProps: { src: '', alt: '' },
  nesting: { acceptsChildren: false },
  render: MediaLeaf('Image'),
  controlSchema: {
    block: [
      {
        id: 'media-image-content',
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

export const backgroundVideoDefinition: ElementDefinition = {
  type: 'background-video',
  label: 'Background Video',
  icon: 'tabler:video-plus',
  category: 'Media',
  defaultProps: { src: '' },
  nesting: { acceptsChildren: false },
  render: MediaLeaf('Background Video'),
  controlSchema: {
    block: [
      {
        id: 'background-video-content',
        title: 'Background Video',
        controls: [
          { id: 'src', type: 'text', label: 'Video URL', prop: 'src', placeholder: 'https://...' },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const lightboxDefinition: ElementDefinition = {
  type: 'lightbox',
  label: 'Lightbox',
  icon: 'tabler:zoom-in',
  category: 'Media',
  defaultProps: {},
  nesting: { acceptsChildren: false },
  render: MediaLeaf('Lightbox'),
  controlSchema: { block: [], inspector: basicInspectorSchema },
}

export const mapDefinition: ElementDefinition = {
  type: 'map',
  label: 'Map',
  icon: 'tabler:map-pin',
  category: 'Media',
  defaultProps: { address: '' },
  nesting: { acceptsChildren: false },
  render: MediaLeaf('Map'),
  controlSchema: {
    block: [
      {
        id: 'map-content',
        title: 'Map',
        controls: [
          {
            id: 'address',
            type: 'text',
            label: 'Address',
            prop: 'address',
            placeholder: '1600 Amphitheatre Pkwy, Mountain View, CA',
          },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const sliderDefinition: ElementDefinition = {
  type: 'slider',
  label: 'Slider',
  icon: 'tabler:carousel-horizontal',
  category: 'Media',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function SliderElement({ 'data-node-id': nodeId, children, style }: ElementRenderProps) {
    return (
      <div
        data-node-id={nodeId}
        style={{
          display: 'block',
          border: '1px dashed #94a3b8',
          borderRadius: 4,
          minHeight: 80,
          overflow: 'hidden',
          ...style,
        }}
      >
        {children}
      </div>
    )
  },
  controlSchema: { block: [], inspector: basicInspectorSchema },
}

export const tabsDefinition: ElementDefinition = {
  type: 'tabs',
  label: 'Tabs',
  icon: 'tabler:table',
  category: 'Media',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function TabsElement({ 'data-node-id': nodeId, children, style }: ElementRenderProps) {
    return (
      <div data-node-id={nodeId} style={{ display: 'block', minHeight: 60, ...style }}>
        {children}
      </div>
    )
  },
  controlSchema: { block: [], inspector: basicInspectorSchema },
}
