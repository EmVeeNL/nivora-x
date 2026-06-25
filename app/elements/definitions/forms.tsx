import React from 'react'
import type { ElementDefinition, ElementRenderProps } from '../types'
import { basicInspectorSchema, textInspectorSchema } from '@/inspector/style/styleSchemas'

function FormLeaf(label: string): React.ComponentType<ElementRenderProps> {
  function LeafEl({ 'data-node-id': nodeId, style }: ElementRenderProps) {
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
          ...style,
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
  render: function FormBlockElement({
    'data-node-id': nodeId,
    children,
    style,
  }: ElementRenderProps) {
    return (
      <form
        data-node-id={nodeId}
        style={{ display: 'block', padding: 16, ...style }}
        onSubmit={(e) => e.preventDefault()}
      >
        {children}
      </form>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'form-block-content',
        title: 'Form',
        controls: [
          { id: 'html-id', type: 'text', label: 'HTML ID', prop: 'htmlId', placeholder: 'my-form' },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const labelDefinition: ElementDefinition = {
  type: 'label',
  label: 'Label',
  icon: 'tabler:tag',
  category: 'Forms',
  defaultProps: { text: 'Label' },
  nesting: { acceptsChildren: false },
  render: function LabelElement({ 'data-node-id': nodeId, node, style }: ElementRenderProps) {
    return (
      <label
        data-node-id={nodeId}
        style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4, ...style }}
      >
        {(node.props['text'] as string | undefined) ?? 'Label'}
      </label>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'label-content',
        title: 'Label',
        controls: [
          { id: 'text', type: 'text', label: 'Text', prop: 'text', defaultValue: 'Label' },
        ],
      },
    ],
    inspector: textInspectorSchema,
  },
}

export const textInputDefinition: ElementDefinition = {
  type: 'text-input',
  label: 'Text Input',
  icon: 'tabler:cursor-text',
  category: 'Forms',
  defaultProps: { placeholder: 'Enter text...' },
  nesting: { acceptsChildren: false },
  render: function TextInputElement({ 'data-node-id': nodeId, node, style }: ElementRenderProps) {
    return (
      <input
        data-node-id={nodeId}
        type="text"
        placeholder={(node.props['placeholder'] as string | undefined) ?? ''}
        readOnly
        style={{
          display: 'block',
          width: '100%',
          padding: '6px 10px',
          border: '1px solid #e2e8f0',
          borderRadius: 4,
          fontSize: 14,
          ...style,
        }}
      />
    )
  },
  controlSchema: {
    block: [
      {
        id: 'text-input-content',
        title: 'Text Input',
        controls: [
          {
            id: 'placeholder',
            type: 'text',
            label: 'Placeholder',
            prop: 'placeholder',
            defaultValue: 'Enter text...',
          },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const textAreaDefinition: ElementDefinition = {
  type: 'text-area',
  label: 'Text Area',
  icon: 'tabler:text-wrap',
  category: 'Forms',
  defaultProps: { placeholder: 'Enter text...' },
  nesting: { acceptsChildren: false },
  render: function TextAreaElement({ 'data-node-id': nodeId, node, style }: ElementRenderProps) {
    return (
      <textarea
        data-node-id={nodeId}
        placeholder={(node.props['placeholder'] as string | undefined) ?? ''}
        readOnly
        style={{
          display: 'block',
          width: '100%',
          padding: '6px 10px',
          border: '1px solid #e2e8f0',
          borderRadius: 4,
          fontSize: 14,
          minHeight: 80,
          resize: 'vertical',
          ...style,
        }}
      />
    )
  },
  controlSchema: {
    block: [
      {
        id: 'text-area-content',
        title: 'Text Area',
        controls: [
          {
            id: 'placeholder',
            type: 'text',
            label: 'Placeholder',
            prop: 'placeholder',
            defaultValue: 'Enter text...',
          },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const checkboxDefinition: ElementDefinition = {
  type: 'checkbox-field',
  label: 'Checkbox',
  icon: 'tabler:checkbox',
  category: 'Forms',
  defaultProps: { label: 'Checkbox' },
  nesting: { acceptsChildren: false },
  render: FormLeaf('Checkbox'),
  controlSchema: {
    block: [
      {
        id: 'checkbox-content',
        title: 'Checkbox',
        controls: [
          { id: 'label', type: 'text', label: 'Label', prop: 'label', defaultValue: 'Checkbox' },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const radioButtonDefinition: ElementDefinition = {
  type: 'radio-button',
  label: 'Radio Button',
  icon: 'tabler:circle-dot',
  category: 'Forms',
  defaultProps: { label: 'Option' },
  nesting: { acceptsChildren: false },
  render: FormLeaf('Radio Button'),
  controlSchema: {
    block: [
      {
        id: 'radio-button-content',
        title: 'Radio Button',
        controls: [
          { id: 'label', type: 'text', label: 'Label', prop: 'label', defaultValue: 'Option' },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const selectDefinition: ElementDefinition = {
  type: 'select',
  label: 'Select',
  icon: 'tabler:selector',
  category: 'Forms',
  defaultProps: { options: [] },
  nesting: { acceptsChildren: false },
  render: FormLeaf('Select'),
  controlSchema: { block: [], inspector: basicInspectorSchema },
}

export const fileUploadDefinition: ElementDefinition = {
  type: 'file-upload',
  label: 'File Upload',
  icon: 'tabler:upload',
  category: 'Forms',
  defaultProps: {},
  nesting: { acceptsChildren: false },
  render: FormLeaf('File Upload'),
  controlSchema: { block: [], inspector: basicInspectorSchema },
}

export const submitButtonDefinition: ElementDefinition = {
  type: 'submit-button',
  label: 'Submit Button',
  icon: 'tabler:send',
  category: 'Forms',
  defaultProps: { label: 'Submit' },
  nesting: { acceptsChildren: false },
  render: function SubmitButtonElement({
    'data-node-id': nodeId,
    node,
    style,
  }: ElementRenderProps) {
    return (
      <button
        type="button"
        data-node-id={nodeId}
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontSize: 14,
          cursor: 'pointer',
          ...style,
        }}
      >
        {(node.props['label'] as string | undefined) ?? 'Submit'}
      </button>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'submit-button-content',
        title: 'Submit Button',
        controls: [
          { id: 'label', type: 'text', label: 'Label', prop: 'label', defaultValue: 'Submit' },
        ],
      },
    ],
    inspector: textInspectorSchema,
  },
}

export const successMessageDefinition: ElementDefinition = {
  type: 'success-message',
  label: 'Success Message',
  icon: 'tabler:circle-check',
  category: 'Forms',
  defaultProps: { text: 'Thank you! Your submission has been received.' },
  nesting: { acceptsChildren: false },
  render: function SuccessMessageElement({
    'data-node-id': nodeId,
    node,
    style,
  }: ElementRenderProps) {
    return (
      <div
        data-node-id={nodeId}
        style={{
          padding: '12px 16px',
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: 4,
          color: '#166534',
          fontSize: 14,
          ...style,
        }}
      >
        {(node.props['text'] as string | undefined) ?? ''}
      </div>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'success-message-content',
        title: 'Success Message',
        controls: [
          {
            id: 'text',
            type: 'textarea',
            label: 'Text',
            prop: 'text',
            defaultValue: 'Thank you! Your submission has been received.',
          },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}

export const errorMessageDefinition: ElementDefinition = {
  type: 'error-message',
  label: 'Error Message',
  icon: 'tabler:alert-circle',
  category: 'Forms',
  defaultProps: { text: 'Oops! Something went wrong.' },
  nesting: { acceptsChildren: false },
  render: function ErrorMessageElement({
    'data-node-id': nodeId,
    node,
    style,
  }: ElementRenderProps) {
    return (
      <div
        data-node-id={nodeId}
        style={{
          padding: '12px 16px',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: 4,
          color: '#991b1b',
          fontSize: 14,
          ...style,
        }}
      >
        {(node.props['text'] as string | undefined) ?? ''}
      </div>
    )
  },
  controlSchema: {
    block: [
      {
        id: 'error-message-content',
        title: 'Error Message',
        controls: [
          {
            id: 'text',
            type: 'textarea',
            label: 'Text',
            prop: 'text',
            defaultValue: 'Oops! Something went wrong.',
          },
        ],
      },
    ],
    inspector: basicInspectorSchema,
  },
}
