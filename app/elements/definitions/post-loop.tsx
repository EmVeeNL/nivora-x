import type { ElementDefinition, ElementRenderProps } from '../types'
import { basicInspectorSchema } from '@/inspector/style/styleSchemas'

/**
 * Post loop — archive templates repeat their loop-item subtree (the element's
 * children) over the query's posts. The editor shows the single authored item
 * with a "repeats per post" hint; the PHP PostLoopRenderer repeats it on the
 * front end. Custom queries + per-post field binding are Phase 14.
 */
export const postLoopDefinition: ElementDefinition = {
  type: 'post-loop',
  label: 'Post Loop',
  icon: 'tabler:list-details',
  category: 'Theme',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function PostLoopElement({
    'data-node-id': nodeId,
    children,
    style,
  }: ElementRenderProps) {
    return (
      <div
        data-node-id={nodeId}
        data-nivorax-loop="post"
        style={{
          display: 'block',
          padding: '8px',
          border: '1px dashed #6366f1',
          borderRadius: 6,
          background: 'rgba(99, 102, 241, 0.04)',
          ...style,
        }}
      >
        <p
          style={{
            margin: '0 0 6px',
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#6366f1',
          }}
        >
          Post Loop — repeats per post
        </p>
        {children}
      </div>
    )
  },
  controlSchema: { block: [], inspector: basicInspectorSchema },
}
