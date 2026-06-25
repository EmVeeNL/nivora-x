/**
 * Parity fixture harness — JS side.
 *
 * Each fixture in fixtures/parity/*.json defines:
 *   - tree       DocumentTree
 *   - breakpoints BreakpointConfig[]
 *   - css         expected CSS output
 *
 * This test ensures generateCss() (the JS producer used by the editor) produces
 * output that matches the fixture expectation exactly. The PHP-side test
 * (plugin/tests/Parity/ParityTest.php) applies the same fixtures to CssGenerator.
 * Both must pass — that is the parity guarantee.
 */

import { readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, it, expect } from 'vitest'
import { generateCss } from '@/css/generate'
import type { DocumentTree } from '@/document/schema/types'
import type { BreakpointConfig } from '@/breakpoints/config'
import type { DesignToken } from '@/tokens/model'

interface ParityFixture {
  description: string
  breakpoints: BreakpointConfig[]
  tokens?: DesignToken[]
  tree: DocumentTree
  css: string
}

const FIXTURES_DIR = resolve(__dirname, '../../../fixtures/parity')

function loadFixtures(): Array<{ name: string; fixture: ParityFixture }> {
  return readdirSync(FIXTURES_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((file) => ({
      name: file.replace('.json', ''),
      fixture: JSON.parse(readFileSync(resolve(FIXTURES_DIR, file), 'utf8')) as ParityFixture,
    }))
}

describe('CSS generator parity — JS vs fixture', () => {
  const fixtures = loadFixtures()

  for (const { name, fixture } of fixtures) {
    it(`${name}: ${fixture.description}`, () => {
      const actual = generateCss(fixture.tree, fixture.breakpoints, fixture.tokens)
      expect(actual).toBe(fixture.css)
    })
  }
})
