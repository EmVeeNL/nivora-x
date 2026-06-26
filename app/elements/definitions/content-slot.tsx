import type { ElementDefinition, ElementRenderProps } from '../types'
import { basicInspectorSchema } from '@/inspector/style/styleSchemas'

/**
 * Content slot — single templates render the current post's body here. In the
 * editor we show a representative placeholder; on the front end the PHP
 * ContentSlotRenderer injects the queried post's NivoraX content (or
 * `post_content`). Full dynamic field binding is Phase 14.
 */
export const contentSlotDefinition: ElementDefinition = {
  type: 'content-slot',
  label: 'Content Slot',
  icon: 'tabler:article-filled',
  category: 'Theme',
  defaultProps: {},
  nesting: { acceptsChildren: false },
  render: function ContentSlotElement({ 'data-node-id': nodeId, style }: ElementRenderProps) {
    return (
      <div
        data-node-id={nodeId}
        data-nivorax-slot="content"
        style={{
          display: 'block',
          padding: '20px',
          border: '1px dashed #6366f1',
          borderRadius: 6,
          background: 'rgba(99, 102, 241, 0.04)',
          color: '#64748b',
          ...style,
        }}
      >
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#6366f1' }}>Post Content</p>
        <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.6 }}>
          The current post’s content renders here on the front end.
        </p>
      </div>
    )
  },
  controlSchema: { block: [], inspector: basicInspectorSchema },
}
