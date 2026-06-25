import type { ElementDefinition, ElementRenderProps } from '../types'
import { textInspectorSchema } from '@/inspector/style/styleSchemas'

function TextElement({ node, 'data-node-id': nodeId, style }: ElementRenderProps) {
  const text = (node.props['text'] as string | undefined) ?? 'Text block'

  return (
    <p
      data-node-id={nodeId}
      style={{
        display: 'block',
        margin: '0 0 1em',
        fontFamily: 'inherit',
        lineHeight: 1.6,
        ...style,
      }}
    >
      {text}
    </p>
  )
}

export const textDefinition: ElementDefinition = {
  type: 'text',
  label: 'Text',
  icon: 'tabler:align-left',
  category: 'Content',
  defaultProps: { text: 'Text block' },
  nesting: { acceptsChildren: false },
  render: TextElement,
  controlSchema: {
    block: [
      {
        id: 'text-content',
        title: 'Text',
        controls: [
          {
            id: 'text',
            type: 'textarea',
            label: 'Text',
            prop: 'text',
            defaultValue: 'Text block',
          },
        ],
      },
    ],
    inspector: textInspectorSchema,
  },
}
