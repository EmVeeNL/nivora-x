import React from 'react'
import type { ElementDefinition, ElementRenderProps } from '../types'
import { basicInspectorSchema } from '@/inspector/style/styleSchemas'
import { PART_ELEMENT_TYPE } from '@/templates/cycleCheck'

/**
 * Embed-by-reference template part. Stores a `templateId`; the PHP renderer
 * resolves and inlines the referenced template at render time so edits to that
 * template propagate to every embed. In the editor we show a reference badge
 * rather than the resolved tree (cross-template preview is server-resolved).
 */
export const partDefinition: ElementDefinition = {
  type: PART_ELEMENT_TYPE,
  label: 'Template Part',
  icon: 'tabler:puzzle',
  category: 'Theme',
  defaultProps: { templateId: 0 },
  nesting: { acceptsChildren: false },
  render: function TemplatePartElement({
    'data-node-id': nodeId,
    node,
    style,
  }: ElementRenderProps) {
    const rawId = (node.props as { templateId?: unknown }).templateId
    const templateId = typeof rawId === 'number' ? rawId : Number(rawId)
    const hasRef = Number.isInteger(templateId) && templateId > 0

    return (
      <div
        data-node-id={nodeId}
        data-nivorax-part={hasRef ? templateId : undefined}
        style={{
          display: 'block',
          padding: '10px 14px',
          border: '1px dashed #6366f1',
          borderRadius: 6,
          color: '#6366f1',
          fontSize: 12,
          background: 'rgba(99, 102, 241, 0.06)',
          ...style,
        }}
      >
        {hasRef ? `⧉ Template part #${templateId}` : '⧉ Template part — choose a template'}
      </div>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'template-part-ref',
        title: 'Template Part',
        controls: [
          {
            id: 'templateId',
            type: 'text',
            label: 'Template ID',
            prop: 'templateId',
            placeholder: 'e.g. 42',
          },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}
