import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import {
  CONDITION_OBJECTS,
  newRule,
  objectTakesValue,
  type ConditionRule,
} from '@/templates/conditions/types'
import { ConditionsEditor } from '@/templates/conditions/ConditionsEditor'

describe('condition types', () => {
  it('covers the five condition objects', () => {
    expect([...CONDITION_OBJECTS]).toEqual([
      'entire_site',
      'post_type',
      'singular',
      'taxonomy',
      'archive',
    ])
  })

  it('treats entire_site as valueless', () => {
    expect(objectTakesValue('entire_site')).toBe(false)
    expect(objectTakesValue('post_type')).toBe(true)
  })

  it('creates a default include/entire_site rule', () => {
    expect(newRule()).toEqual({ behavior: 'include', object: 'entire_site', value: '' })
  })
})

describe('ConditionsEditor', () => {
  beforeEach(() => {
    window.nivoraxBootstrap = {
      postId: 9,
      mode: 'nivorax',
      template: { type: 'single' },
      restRoot: 'https://example.test/wp-json/',
      restNonce: 'nonce',
      adminUrl: 'https://example.test/wp-admin/',
      pagesUrl: 'https://example.test/wp-admin/admin.php?page=nivorax-all-pages',
      homeUrl: 'https://example.test/',
      siteName: 'Example',
      version: '0.1.0',
    }
  })

  afterEach(() => {
    delete window.nivoraxBootstrap
    vi.restoreAllMocks()
  })

  it('loads and renders existing conditions', async () => {
    const rules: ConditionRule[] = [{ behavior: 'include', object: 'post_type', value: 'post' }]
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ conditions: rules }), { status: 200 }),
    )

    render(<ConditionsEditor templateId={9} />)

    await waitFor(() => expect(screen.getByDisplayValue('post')).toBeInTheDocument())
    expect(screen.getByLabelText('Condition type')).toHaveValue('post_type')
  })

  it('adds a new rule row when "Add condition" is clicked', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ conditions: [] }), { status: 200 }),
    )

    render(<ConditionsEditor templateId={9} />)
    await waitFor(() => expect(screen.getByText(/not assigned anywhere/i)).toBeInTheDocument())

    fireEvent.click(screen.getByTestId('conditions-add-rule'))
    expect(screen.getByLabelText('Condition type')).toBeInTheDocument()
  })

  it('PUTs the conditions when Save is clicked', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ conditions: [] }), { status: 200 }))

    render(<ConditionsEditor templateId={9} />)
    await waitFor(() => expect(screen.getByTestId('conditions-save')).toBeInTheDocument())

    fireEvent.click(screen.getByTestId('conditions-save'))

    await waitFor(() => {
      const putCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT')
      expect(putCall?.[0]).toContain('/templates/9/conditions')
    })
  })
})
