import { describe, it, expect, beforeEach } from 'vitest'
import {
  registerLeftPanel,
  listLeftPanels,
  _clearLeftPanelRegistry,
} from '@/shell/left/leftPanelRegistry'

function noop() {
  return null
}

const mkPanel = (id: string) => ({
  id,
  label: `Label ${id}`,
  icon: `tabler:circle`,
  component: noop as Parameters<typeof registerLeftPanel>[0]['component'],
})

beforeEach(() => {
  _clearLeftPanelRegistry()
})

describe('registerLeftPanel / listLeftPanels', () => {
  it('registered panels appear in listLeftPanels', () => {
    registerLeftPanel(mkPanel('a'))
    registerLeftPanel(mkPanel('b'))
    const ids = listLeftPanels().map((p) => p.id)
    expect(ids).toContain('a')
    expect(ids).toContain('b')
  })

  it('panels appear in registration order', () => {
    registerLeftPanel(mkPanel('first'))
    registerLeftPanel(mkPanel('second'))
    const ids = listLeftPanels().map((p) => p.id)
    expect(ids[0]).toBe('first')
    expect(ids[1]).toBe('second')
  })

  it('duplicate id replaces the entry in place (same position)', () => {
    registerLeftPanel(mkPanel('a'))
    registerLeftPanel(mkPanel('b'))
    registerLeftPanel({ ...mkPanel('a'), label: 'Updated A' })
    const panels = listLeftPanels()
    expect(panels).toHaveLength(2)
    expect(panels[0]?.label).toBe('Updated A')
  })

  it('returns empty when registry is clear', () => {
    expect(listLeftPanels()).toHaveLength(0)
  })
})
