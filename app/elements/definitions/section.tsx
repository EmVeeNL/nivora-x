import type { ElementDefinition, ElementRenderProps } from '../types'
import { layoutInspectorSchema } from '@/inspector/style/styleSchemas'

function SectionElement({ children, 'data-node-id': nodeId, style }: ElementRenderProps) {
  return (
    <section
      data-node-id={nodeId}
      style={{
        display: 'block',
        width: '100%',
        minHeight: 80,
        boxSizing: 'border-box',
        padding: '24px 0',
        ...style,
      }}
    >
      {children}
    </section>
  )
}

export const sectionDefinition: ElementDefinition = {
  type: 'section',
  label: 'Section',
  icon: 'tabler:section',
  category: 'Layout',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: SectionElement,
  controlSchema: {
    block: [
      {
        id: 'section-content',
        title: 'Section',
        controls: [
          {
            id: 'html-id',
            type: 'text',
            label: 'HTML ID',
            prop: 'htmlId',
            placeholder: 'hero',
          },
        ],
      },
    ],
    inspector: layoutInspectorSchema,
  },
}
