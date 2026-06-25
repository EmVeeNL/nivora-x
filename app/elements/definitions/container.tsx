import type { ElementDefinition, ElementRenderProps } from '../types'
import { layoutInspectorSchema } from '@/inspector/style/styleSchemas'

function ContainerElement({ children, 'data-node-id': nodeId, style }: ElementRenderProps) {
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
        ...style,
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
  controlSchema: {
    block: [
      {
        id: 'container-content',
        title: 'Container',
        controls: [
          {
            id: 'html-id',
            type: 'text',
            label: 'HTML ID',
            prop: 'htmlId',
            placeholder: 'content',
          },
        ],
      },
    ],
    inspector: layoutInspectorSchema,
  },
}
