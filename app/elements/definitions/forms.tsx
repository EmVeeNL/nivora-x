import React from 'react'
import type { ElementDefinition, ElementRenderProps } from '../types'

function makeLeaf(label: string): React.ComponentType<ElementRenderProps> {
  function LeafEl({ 'data-node-id': nodeId }: ElementRenderProps) {
    return (
      <div
        data-node-id={nodeId}
        style={{
          display: 'block',
          padding: '4px 8px',
          border: '1px dashed #94a3b8',
          borderRadius: 3,
          color: '#94a3b8',
          fontSize: 11,
          pointerEvents: 'none',
        }}
      >
        {label}
      </div>
    )
  }
  LeafEl.displayName = label
  return LeafEl
}

export const formBlockDefinition: ElementDefinition = {
  type: 'form-block',
  label: 'Form Block',
  icon: 'tabler:forms',
  category: 'Forms',
  defaultProps: {},
  nesting: { acceptsChildren: true },
  render: function FormBlockElement({ 'data-node-id': nodeId, children }: ElementRenderProps) {
    return (
      <form
        data-node-id={nodeId}
        style={{ display: 'block', padding: 16 }}
        onSubmit={(e) => e.preventDefault()}
      >
        {children}
      </form>
    )
  },
}

export const labelDefinition: ElementDefinition = {
  type: 'label',
  label: 'Label',
  icon: 'tabler:tag',
  category: 'Forms',
  defaultProps: { text: 'Label' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Label'),
}

export const textInputDefinition: ElementDefinition = {
  type: 'text-input',
  label: 'Text Input',
  icon: 'tabler:cursor-text',
  category: 'Forms',
  defaultProps: { placeholder: 'Enter text...' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Text Input'),
}

export const textAreaDefinition: ElementDefinition = {
  type: 'text-area',
  label: 'Text Area',
  icon: 'tabler:text-wrap',
  category: 'Forms',
  defaultProps: { placeholder: 'Enter text...' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Text Area'),
}

export const checkboxDefinition: ElementDefinition = {
  type: 'checkbox-field',
  label: 'Checkbox',
  icon: 'tabler:checkbox',
  category: 'Forms',
  defaultProps: { label: 'Checkbox' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Checkbox'),
}

export const radioButtonDefinition: ElementDefinition = {
  type: 'radio-button',
  label: 'Radio Button',
  icon: 'tabler:circle-dot',
  category: 'Forms',
  defaultProps: { label: 'Option' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Radio Button'),
}

export const selectDefinition: ElementDefinition = {
  type: 'select',
  label: 'Select',
  icon: 'tabler:selector',
  category: 'Forms',
  defaultProps: { options: [] },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Select'),
}

export const fileUploadDefinition: ElementDefinition = {
  type: 'file-upload',
  label: 'File Upload',
  icon: 'tabler:upload',
  category: 'Forms',
  defaultProps: {},
  nesting: { acceptsChildren: false },
  render: makeLeaf('File Upload'),
}

export const submitButtonDefinition: ElementDefinition = {
  type: 'submit-button',
  label: 'Submit Button',
  icon: 'tabler:send',
  category: 'Forms',
  defaultProps: { label: 'Submit' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Submit Button'),
}

export const successMessageDefinition: ElementDefinition = {
  type: 'success-message',
  label: 'Success Message',
  icon: 'tabler:circle-check',
  category: 'Forms',
  defaultProps: { text: 'Thank you! Your submission has been received.' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Success Message'),
}

export const errorMessageDefinition: ElementDefinition = {
  type: 'error-message',
  label: 'Error Message',
  icon: 'tabler:alert-circle',
  category: 'Forms',
  defaultProps: { text: 'Oops! Something went wrong.' },
  nesting: { acceptsChildren: false },
  render: makeLeaf('Error Message'),
}
