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

export const navbarDefinition: ElementDefinition = {
  type: 'navbar',
  label: 'Navbar',
  icon: 'tabler:layout-navbar',
  category: 'Components',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function NavbarElement({ 'data-node-id': nodeId, children }: ElementRenderProps) {
    return (
      <nav
        data-node-id={nodeId}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 16px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          minHeight: 56,
        }}
      >
        {children}
      </nav>
    )
  },
}

export const dropdownDefinition: ElementDefinition = {
  type: 'dropdown',
  label: 'Dropdown',
  icon: 'tabler:chevron-down',
  category: 'Components',
  defaultProps: { label: 'Dropdown' },
  nesting: { acceptsChildren: true },
  render: makeLeaf('Dropdown'),
}

export const searchBarDefinition: ElementDefinition = {
  type: 'search-bar',
  label: 'Search',
  icon: 'tabler:search',
  category: 'Components',
  defaultProps: { placeholder: 'Search...' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Search'),
}

export const sliderComponentDefinition: ElementDefinition = {
  type: 'slider-component',
  label: 'Slider',
  icon: 'tabler:carousel-horizontal',
  category: 'Components',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function SliderComponentElement({
    'data-node-id': nodeId,
    children,
  }: ElementRenderProps) {
    return (
      <div
        data-node-id={nodeId}
        style={{
          display: 'block',
          border: '1px dashed #94a3b8',
          borderRadius: 4,
          minHeight: 80,
        }}
      >
        {children}
      </div>
    )
  },
}

export const tabsComponentDefinition: ElementDefinition = {
  type: 'tabs-component',
  label: 'Tabs',
  icon: 'tabler:table',
  category: 'Components',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function TabsComponentElement({ 'data-node-id': nodeId, children }: ElementRenderProps) {
    return (
      <div data-node-id={nodeId} style={{ display: 'block', minHeight: 60 }}>
        {children}
      </div>
    )
  },
}

export const lightboxComponentDefinition: ElementDefinition = {
  type: 'lightbox-component',
  label: 'Lightbox',
  icon: 'tabler:zoom-in',
  category: 'Components',
  defaultProps: {},
  nesting: { acceptsChildren: false },
  render: makeLeaf('Lightbox'),
}

export const menuDefinition: ElementDefinition = {
  type: 'menu',
  label: 'Menu',
  icon: 'tabler:menu-2',
  category: 'Components',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function MenuElement({ 'data-node-id': nodeId, children }: ElementRenderProps) {
    return (
      <nav data-node-id={nodeId} style={{ display: 'block' }}>
        {children}
      </nav>
    )
  },
}
