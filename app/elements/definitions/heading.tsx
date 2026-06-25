import type { ElementDefinition, ElementRenderProps } from '../types'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

function HeadingElement({ node, 'data-node-id': nodeId }: ElementRenderProps) {
  const level = (node.props['level'] as number | undefined) ?? 2
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
}
