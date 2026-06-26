/** Mirrors the PHP TemplateModel condition vocabulary. */

export type ConditionBehavior = 'include' | 'exclude'

export type ConditionObject = 'entire_site' | 'post_type' | 'singular' | 'taxonomy' | 'archive'

export interface ConditionRule {
  behavior: ConditionBehavior
  object: ConditionObject
  value: string
}

export const CONDITION_OBJECTS: readonly ConditionObject[] = [
  'entire_site',
  'post_type',
  'singular',
  'taxonomy',
  'archive',
]

export const CONDITION_OBJECT_LABELS: Record<ConditionObject, string> = {
  entire_site: 'Entire site',
  post_type: 'Post type',
  singular: 'Specific content',
  taxonomy: 'Taxonomy term',
  archive: 'Archive',
}

/** Placeholder/hint for the value field per object type. */
export const CONDITION_VALUE_HINTS: Record<ConditionObject, string> = {
  entire_site: '',
  post_type: 'post type slug (e.g. post)',
  singular: 'post ID (e.g. 42)',
  taxonomy: 'taxonomy:term_id (e.g. category:3)',
  archive: 'post type slug (blank = any)',
}

/** Whether the object type takes a value (entire_site does not). */
export function objectTakesValue(object: ConditionObject): boolean {
  return object !== 'entire_site'
}

/** A fresh default rule. */
export function newRule(): ConditionRule {
  return { behavior: 'include', object: 'entire_site', value: '' }
}
