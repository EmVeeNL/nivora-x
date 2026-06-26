import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ControlRenderer } from '@/inspector/controls/ControlRenderer'
import { unitValue } from '@/inspector/controls/valueUnits'
import { useDocumentStore } from '@/document/store'
import { useUiStore } from '@/state/uiStore'
import type { ControlSectionSchema } from '@/inspector/controls/types'
import type { DocumentTree, NxNode } from '@/document/schema/types'

const openWordPressImagePicker = vi.fn()

vi.mock('@/lib/wordpressMedia', () => ({
  openWordPressImagePicker: (callback: (attachment: { url?: string }) => void) => {
    openWordPressImagePicker(callback)
  },
}))

function node(props: Record<string, unknown> = {}): NxNode {
  return { id: 'node', type: 'heading', props, children: [], overrides: {}, meta: {} }
}

function tree(n: NxNode = node()): DocumentTree {
  return {
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: '__root__',
        props: {},
        children: ['node'],
        overrides: {},
        meta: {},
      },
      node: n,
    },
  }
}

const schema: ControlSectionSchema[] = [
  {
    id: 'content',
    title: 'Content',
    controls: [
      { id: 'text', type: 'text', label: 'Text', prop: 'text', defaultValue: 'Heading' },
      {
        id: 'level',
        type: 'select',
        label: 'Level',
        prop: 'level',
        defaultValue: '2',
        options: [
          { label: 'H1', value: '1' },
          { label: 'H2', value: '2' },
        ],
      },
      {
        id: 'width',
        type: 'unit',
        label: 'Width',
        prop: 'width',
        defaultValue: unitValue(100, '%'),
      },
      {
        id: 'image-src',
        type: 'text',
        label: 'Image',
        prop: 'src',
        mediaType: 'image',
        defaultValue: '',
      },
      {
        id: 'opacity',
        type: 'slider',
        label: 'Opacity',
        prop: 'opacity',
        defaultValue: 100,
        min: 0,
        max: 100,
        coalesce: true,
      },
    ],
  },
]

beforeEach(() => {
  openWordPressImagePicker.mockReset()
  useDocumentStore.setState({
    tree: tree(),
    documentMeta: {},
    selectedId: 'node',
    isDirty: false,
    past: [],
    future: [],
    _lastCoalesceKey: null,
    _lastCoalesceTime: 0,
  })
  useUiStore.setState({ openSections: { content: true } })
})

describe('ControlRenderer', () => {
  it('renders controls from a declarative schema', () => {
    render(<ControlRenderer node={node()} sections={schema} />)
    expect(screen.getByLabelText('Text')).toBeInTheDocument()
    expect(screen.getByLabelText('Level')).toBeInTheDocument()
    expect(screen.getByText('Width')).toBeInTheDocument()
  })

  it('updates node props through the document store', () => {
    render(<ControlRenderer node={node()} sections={schema} />)
    fireEvent.change(screen.getByLabelText('Text'), { target: { value: 'Intro' } })
    expect(useDocumentStore.getState().tree!.nodes['node']!.props['text']).toBe('Intro')
  })

  it('writes the shared unit value model', () => {
    render(<ControlRenderer node={node()} sections={schema} />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0]!, { target: { value: '80' } })
    expect(useDocumentStore.getState().tree!.nodes['node']!.props['width']).toEqual({
      value: 80,
      unit: '%',
    })
  })

  it('coalesces continuous control edits into one undo entry', () => {
    render(<ControlRenderer node={node()} sections={schema} />)
    const slider = screen.getByRole('slider')

    fireEvent.change(slider, { target: { value: '80' } })
    fireEvent.change(slider, { target: { value: '60' } })

    expect(useDocumentStore.getState().tree!.nodes['node']!.props['opacity']).toBe(60)
    expect(useDocumentStore.getState().past).toHaveLength(1)
  })

  it('opens the WordPress media picker for image-enabled text controls', () => {
    render(<ControlRenderer node={node()} sections={schema} />)

    fireEvent.click(screen.getByTitle('Choose from WordPress Media Library'))

    expect(openWordPressImagePicker).toHaveBeenCalledTimes(1)

    const callback = openWordPressImagePicker.mock.calls[0]?.[0] as
      | ((attachment: { url?: string }) => void)
      | undefined

    callback?.({ url: 'https://example.com/media.jpg' })

    expect(useDocumentStore.getState().tree!.nodes['node']!.props['src']).toBe(
      'https://example.com/media.jpg',
    )
  })

  it('skips unknown control types with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    render(
      <ControlRenderer
        node={node()}
        sections={[
          {
            id: 'bad',
            title: 'Bad',
            controls: [{ id: 'x', type: 'mystery', label: 'X', prop: 'x' }],
          },
        ]}
      />,
    )
    expect(warn).toHaveBeenCalledWith('Unknown control type "mystery" skipped')
    warn.mockRestore()
  })
})
