import { registerElement } from '../registry'
import { sectionDefinition } from './section'
import { containerDefinition } from './container'
import { headingDefinition } from './heading'
import { textDefinition } from './text'
import {
  bodyDefinition,
  divBlockDefinition,
  gridDefinition,
  columnsDefinition,
  listDefinition,
  listItemDefinition,
  linkBlockDefinition,
  blockquoteDefinition,
  componentDefinition,
  slotDefinition,
} from './layout'
import {
  buttonDefinition,
  textLinkDefinition,
  imageDefinition,
  videoDefinition,
  youtubeVideoDefinition,
  lottieDefinition,
  htmlEmbedDefinition,
  dividerDefinition,
  spacerDefinition,
  embedDefinition,
} from './basic'
import {
  paragraphDefinition,
  richTextDefinition,
  textSpanDefinition,
  orderedListDefinition,
  unorderedListDefinition,
} from './typography'
import {
  mediaImageDefinition,
  backgroundVideoDefinition,
  lightboxDefinition,
  mapDefinition,
  sliderDefinition,
  tabsDefinition,
} from './media'
import {
  formBlockDefinition,
  labelDefinition,
  textInputDefinition,
  textAreaDefinition,
  checkboxDefinition,
  radioButtonDefinition,
  selectDefinition,
  fileUploadDefinition,
  submitButtonDefinition,
  successMessageDefinition,
  errorMessageDefinition,
} from './forms'
import { collectionListDefinition, collectionItemDefinition, collectionPageDefinition } from './cms'
import {
  navbarDefinition,
  dropdownDefinition,
  searchBarDefinition,
  sliderComponentDefinition,
  tabsComponentDefinition,
  lightboxComponentDefinition,
  menuDefinition,
} from './components-elements'

/** Register all built-in elements. Safe to call multiple times. */
export function registerStarterElements(): void {
  // Layout
  registerElement(bodyDefinition)
  registerElement(sectionDefinition)
  registerElement(containerDefinition)
  registerElement(divBlockDefinition)
  registerElement(gridDefinition)
  registerElement(columnsDefinition)
  registerElement(listDefinition)
  registerElement(listItemDefinition)
  registerElement(linkBlockDefinition)
  registerElement(blockquoteDefinition)
  registerElement(componentDefinition)
  registerElement(slotDefinition)

  // Basic
  registerElement(buttonDefinition)
  registerElement(textLinkDefinition)
  registerElement(imageDefinition)
  registerElement(videoDefinition)
  registerElement(youtubeVideoDefinition)
  registerElement(lottieDefinition)
  registerElement(htmlEmbedDefinition)
  registerElement(dividerDefinition)
  registerElement(spacerDefinition)
  registerElement(embedDefinition)

  // Typography
  registerElement(headingDefinition)
  registerElement(paragraphDefinition)
  registerElement(textDefinition)
  registerElement(richTextDefinition)
  registerElement(textSpanDefinition)
  registerElement(orderedListDefinition)
  registerElement(unorderedListDefinition)

  // Media
  registerElement(mediaImageDefinition)
  registerElement(backgroundVideoDefinition)
  registerElement(lightboxDefinition)
  registerElement(mapDefinition)
  registerElement(sliderDefinition)
  registerElement(tabsDefinition)

  // Forms
  registerElement(formBlockDefinition)
  registerElement(labelDefinition)
  registerElement(textInputDefinition)
  registerElement(textAreaDefinition)
  registerElement(checkboxDefinition)
  registerElement(radioButtonDefinition)
  registerElement(selectDefinition)
  registerElement(fileUploadDefinition)
  registerElement(submitButtonDefinition)
  registerElement(successMessageDefinition)
  registerElement(errorMessageDefinition)

  // CMS
  registerElement(collectionListDefinition)
  registerElement(collectionItemDefinition)
  registerElement(collectionPageDefinition)

  // Components
  registerElement(navbarDefinition)
  registerElement(dropdownDefinition)
  registerElement(searchBarDefinition)
  registerElement(sliderComponentDefinition)
  registerElement(tabsComponentDefinition)
  registerElement(lightboxComponentDefinition)
  registerElement(menuDefinition)
}

export { sectionDefinition, containerDefinition, headingDefinition, textDefinition }
