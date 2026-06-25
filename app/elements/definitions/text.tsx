import type { ElementDefinition, ElementRenderProps } from '../types'

function TextElement({ node, 'data-node-id': nodeId }: ElementRenderProps) {
  const text = (node.props['text'] as string | undefined) ?? 'Text block'

  return (
    <p
      data-node-id={nodeId}
      style={{
        display: 'block',
        margin: '0 0 1em',
        fontFamily: 'inherit',
        lineHeight: 1.6,
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
}
