import type { ElementDefinition, ElementRenderProps } from '../types'

function ContainerElement({ children, 'data-node-id': nodeId }: ElementRenderProps) {
  return (
    <div
      data-node-id={nodeId}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        boxSizing: 'border-box',
        minHeight: 48,
      }}
    >
      {children}
    </div>
  )
}

export const containerDefinition: ElementDefinition = {
  type: 'container',
  label: 'Container',
  icon: 'tabler:container',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: ContainerElement,
}
