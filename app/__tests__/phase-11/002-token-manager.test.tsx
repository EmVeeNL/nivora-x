import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TokenManager } from '@/tokens/manager/TokenManager'
import { useTokenStore } from '@/tokens/store'
import { DEFAULT_TOKENS } from '@/tokens/defaults'

vi.mock('@/tokens/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/tokens/store')>()
  return {
    ...actual,
    useTokenStore: Object.assign(
      (selector: (s: ReturnType<typeof actual.useTokenStore.getState>) => unknown) =>
        selector(actual.useTokenStore.getState()),
      actual.useTokenStore,
    ),
  }
})

vi.mock('@/inspector/style/fontFamilies', () => ({
  SYSTEM_FONT_OPTIONS: [{ label: 'System UI', value: 'system-ui' }],
  loadWordPressFontOptions: () => Promise.resolve([]),
}))

beforeEach(() => {
  useTokenStore.setState({ tokens: [...DEFAULT_TOKENS], _loaded: true })
})

describe('TokenManager', () => {
  it('renders the panel with all four group sections', () => {
    render(<TokenManager />)
    expect(screen.getByText('Colors')).toBeTruthy()
    expect(screen.getByText('Typography')).toBeTruthy()
    expect(screen.getByText('Spacing')).toBeTruthy()
    expect(screen.getByText('Effects')).toBeTruthy()
  })

  it('shows the total token count in the panel header', () => {
    render(<TokenManager />)
    expect(screen.getByTestId('token-manager').textContent).toContain('19')
  })

  it('renders token names from the store', () => {
    render(<TokenManager />)
    expect(screen.getByText('Primary')).toBeTruthy()
    expect(screen.getByText('Sans')).toBeTruthy()
    expect(screen.getAllByText('Medium').length).toBeGreaterThan(0)
  })

  it('opens the editor for a token when edit button is clicked', () => {
    render(<TokenManager />)
    const editBtns = screen.getAllByTitle('Edit token')
    fireEvent.click(editBtns[0]!)
    expect(screen.getByPlaceholderText('Token name')).toBeTruthy()
  })

  it('closes the editor when cancel is clicked', () => {
    render(<TokenManager />)
    const editBtns = screen.getAllByTitle('Edit token')
    fireEvent.click(editBtns[0]!)
    expect(screen.getByPlaceholderText('Token name')).toBeTruthy()
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByPlaceholderText('Token name')).toBeNull()
  })

  it('updates the token when saved via the editor', () => {
    render(<TokenManager />)
    const editBtns = screen.getAllByTitle('Edit token')
    fireEvent.click(editBtns[0]!)
    const nameInput = screen.getByPlaceholderText('Token name')
    fireEvent.change(nameInput, { target: { value: 'Renamed Token' } })
    fireEvent.click(screen.getByText('Update'))
    expect(screen.getByText('Renamed Token')).toBeTruthy()
  })

  it('removes a token when delete is clicked', () => {
    render(<TokenManager />)
    const initialCount = useTokenStore.getState().tokens.length
    const deleteBtns = screen.getAllByTitle('Delete token')
    fireEvent.click(deleteBtns[0]!)
    expect(useTokenStore.getState().tokens.length).toBe(initialCount - 1)
  })

  it('shows a create form when "Add color" is clicked', () => {
    render(<TokenManager />)
    const addBtns = screen.getAllByText(/^Add /)
    fireEvent.click(addBtns[0]!)
    expect(screen.getByPlaceholderText('Token name')).toBeTruthy()
    expect(screen.getByText('Create')).toBeTruthy()
  })

  it('creates a new token via the create form', () => {
    render(<TokenManager />)
    const addBtns = screen.getAllByText(/^Add /)
    fireEvent.click(addBtns[0]!)
    fireEvent.change(screen.getByPlaceholderText('Token name'), {
      target: { value: 'Brand Blue' },
    })
    fireEvent.click(screen.getByText('Create'))
    expect(useTokenStore.getState().tokens.some((t) => t.name === 'Brand Blue')).toBe(true)
  })
})
