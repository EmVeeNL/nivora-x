import type { ElementDefinition, ElementRenderProps } from '../types'
import { textInspectorSchema } from '@/inspector/style/styleSchemas'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

function HeadingElement({ node, 'data-node-id': nodeId, style }: ElementRenderProps) {
  const level = Number((node.props['level'] as number | string | undefined) ?? 2)
  const text = (node.props['text'] as string | undefined) ?? 'Heading'
  const clamped = Math.min(Math.max(Math.round(level), 1), 6)
  const Tag = `h${clamped}` as HeadingTag

  return (
    <Tag
      data-node-id={nodeId}
      style={{
        display: 'block',
        margin: '0 0 0.5em',
        fontFamily: 'inherit',
        fontWeight: 700,
        lineHeight: 1.25,
        ...style,
      }}
    >
      {text}
    </Tag>
  )
}

export const headingDefinition: ElementDefinition = {
  type: 'heading',
  label: 'Heading',
  icon: 'tabler:heading',
  category: 'Content',
  defaultProps: { text: 'Heading', level: 2 },
  nesting: { acceptsChildren: false },
  render: HeadingElement,
  controlSchema: {
    block: [
      {
        id: 'heading-content',
        title: 'Heading',
        controls: [
          {
            id: 'heading-text',
            type: 'text',
            label: 'Text',
            prop: 'text',
            defaultValue: 'Heading',
          },
          {
            id: 'heading-level',
            type: 'select',
            label: 'Level',
            prop: 'level',
            defaultValue: '2',
            options: [
              { label: 'H1', value: '1' },
              { label: 'H2', value: '2' },
              { label: 'H3', value: '3' },
              { label: 'H4', value: '4' },
              { label: 'H5', value: '5' },
              { label: 'H6', value: '6' },
            ],
          },
        ],
      },
    ],
    inspector: textInspectorSchema,
  },
}
