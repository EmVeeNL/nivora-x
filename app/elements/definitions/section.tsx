import type { ElementDefinition, ElementRenderProps } from '../types'

function SectionElement({ children, 'data-node-id': nodeId }: ElementRenderProps) {
  return (
    <section
      data-node-id={nodeId}
      style={{
        display: 'block',
        width: '100%',
        minHeight: 80,
        boxSizing: 'border-box',
        padding: '24px 0',
      }}
    >
      {children}
    </section>
  )
}

export const sectionDefinition: ElementDefinition = {
  type: 'section',
  label: 'Section',
  icon: 'layout-panel-top',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: SectionElement,
}
