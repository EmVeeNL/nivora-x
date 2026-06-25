import { registerElement } from '../registry'
import { sectionDefinition } from './section'
import { containerDefinition } from './container'
import { headingDefinition } from './heading'
import { textDefinition } from './text'

/** Register all built-in starter elements. Safe to call multiple times. */
export function registerStarterElements(): void {
  registerElement(sectionDefinition)
  registerElement(containerDefinition)
  registerElement(headingDefinition)
  registerElement(textDefinition)
}

export { sectionDefinition, containerDefinition, headingDefinition, textDefinition }
