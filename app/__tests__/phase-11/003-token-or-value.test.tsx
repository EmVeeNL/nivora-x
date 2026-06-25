import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { TokenOrValue } from '@/inspector/controls/TokenOrValue'
import { makeTokenRef, isTokenRef } from '@/tokens/model'
import { useTokenStore } from '@/tokens/store'
import { DEFAULT_TOKENS } from '@/tokens/defaults'

beforeEach(() => {
  useTokenStore.setState({ tokens: [...DEFAULT_TOKENS], _loaded: true })
})

describe('TokenOrValue', () => {
  it('renders children when value is a raw string', () => {
    let captured: unknown = undefined
    render(
      <TokenOrValue
        value="#ff0000"
        group="color"
        onChange={(v) => {
          captured = v
        }}
      >
        {(val, onChange) => (
          <input data-testid="raw" value={String(val)} onChange={(e) => onChange(e.target.value)} />
        )}
      </TokenOrValue>,
    )
    expect(screen.getByTestId('raw')).toBeTruthy()
    expect(captured).toBeUndefined()
  })

  it('shows a link-to-token button in raw mode', () => {
    render(
      <TokenOrValue value="#ff0000" group="color" onChange={() => undefined}>
        {(val, onChange) => <input value={String(val)} onChange={() => onChange(val)} />}
      </TokenOrValue>,
    )
    expect(screen.getByTitle('Link to token')).toBeTruthy()
  })

  it('switches to token mode when the link button is clicked', () => {
    let stored: unknown = '#ff0000'
    const { rerender } = render(
      <TokenOrValue
        value={stored}
        group="color"
        onChange={(v) => {
          stored = v
        }}
      >
        {(val, onChange) => <input value={String(val)} onChange={() => onChange(val)} />}
      </TokenOrValue>,
    )
    fireEvent.click(screen.getByTitle('Link to token'))
    expect(isTokenRef(stored)).toBe(true)

    rerender(
      <TokenOrValue
        value={stored}
        group="color"
        onChange={(v) => {
          stored = v
        }}
      >
        {(val, onChange) => <input value={String(val)} onChange={() => onChange(val)} />}
      </TokenOrValue>,
    )
    expect(screen.getByTestId('token-picker')).toBeTruthy()
  })

  it('stores a token ref with the correct id when a token is selected', () => {
    let stored: unknown = makeTokenRef('color-primary')
    render(
      <TokenOrValue
        value={stored}
        group="color"
        onChange={(v) => {
          stored = v
        }}
      >
        {(val, onChange) => <input value={String(val)} onChange={() => onChange(val)} />}
      </TokenOrValue>,
    )
    const picker = screen.getByTestId('token-picker')
    fireEvent.change(picker, { target: { value: 'color-accent' } })
    expect(isTokenRef(stored)).toBe(true)
    if (isTokenRef(stored)) expect(stored.__token).toBe('color-accent')
  })

  it('switches back to raw mode when the unlink button is clicked', () => {
    let stored: unknown = makeTokenRef('color-primary')
    const { rerender } = render(
      <TokenOrValue
        value={stored}
        group="color"
        onChange={(v) => {
          stored = v
        }}
      >
        {(val, onChange) => <input value={String(val)} onChange={() => onChange(val)} />}
      </TokenOrValue>,
    )
    fireEvent.click(screen.getByTitle('Switch to raw value'))
    expect(isTokenRef(stored)).toBe(false)

    rerender(
      <TokenOrValue
        value={stored}
        group="color"
        onChange={(v) => {
          stored = v
        }}
      >
        {(val, onChange) => <input value={String(val)} onChange={() => onChange(val)} />}
      </TokenOrValue>,
    )
    expect(screen.queryByTestId('token-picker')).toBeNull()
  })

  it('filters token picker to the matching group', () => {
    render(
      <TokenOrValue value={makeTokenRef('color-primary')} group="color" onChange={() => undefined}>
        {(val, onChange) => <input value={String(val)} onChange={() => onChange(val)} />}
      </TokenOrValue>,
    )
    const picker = screen.getByTestId('token-picker')
    const options = Array.from(picker.querySelectorAll('option')).map(
      (o) => o.getAttribute('value') ?? '',
    )
    const colorTokenIds = DEFAULT_TOKENS.filter((t) => t.group === 'color').map((t) => t.id)
    for (const id of colorTokenIds) {
      expect(options).toContain(id)
    }
    const spacingIds = DEFAULT_TOKENS.filter((t) => t.group === 'spacing').map((t) => t.id)
    for (const id of spacingIds) {
      expect(options).not.toContain(id)
    }
  })
})
