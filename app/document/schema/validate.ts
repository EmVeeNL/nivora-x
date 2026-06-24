import type { DocumentEnvelope, DocumentTree, NxNode } from './types'

export interface ValidationError {
  readonly field: string
  readonly message: string
}

export type ValidationResult<T> =
  | { readonly ok: true; readonly value: T; readonly errors: [] }
  | { readonly ok: false; readonly value?: undefined; readonly errors: ValidationError[] }

function pass<T>(value: T): ValidationResult<T> {
  return { ok: true, value, errors: [] }
}

function fail<T>(errors: ValidationError[]): ValidationResult<T> {
  return { ok: false, errors }
}

function e(field: string, message: string): ValidationError {
  return { field, message }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function validateNode(raw: unknown, nodeKey: string): ValidationResult<NxNode> {
  if (!isObject(raw)) {
    return fail([e(`nodes.${nodeKey}`, 'must be an object')])
  }

  const errors: ValidationError[] = []
  const p = `nodes.${nodeKey}`

  if (typeof raw['id'] !== 'string' || raw['id'] === '') {
    errors.push(e(`${p}.id`, 'must be a non-empty string'))
  }
  if (typeof raw['type'] !== 'string' || raw['type'] === '') {
    errors.push(e(`${p}.type`, 'must be a non-empty string'))
  }
  if (!isObject(raw['props'])) {
    errors.push(e(`${p}.props`, 'must be an object'))
  }
  if (!Array.isArray(raw['children'])) {
    errors.push(e(`${p}.children`, 'must be an array'))
  } else {
    for (let i = 0; i < raw['children'].length; i++) {
      if (typeof (raw['children'] as unknown[])[i] !== 'string') {
        errors.push(e(`${p}.children[${i}]`, 'must be a string'))
      }
    }
  }
  if (!isObject(raw['overrides'])) {
    errors.push(e(`${p}.overrides`, 'must be an object'))
  }
  if (!isObject(raw['meta'])) {
    errors.push(e(`${p}.meta`, 'must be an object'))
  }

  if (errors.length > 0) return fail(errors)
  return pass(raw as unknown as NxNode)
}

export function validateTree(raw: unknown): ValidationResult<DocumentTree> {
  if (!isObject(raw)) {
    return fail([e('tree', 'must be an object')])
  }

  const errors: ValidationError[] = []

  if (typeof raw['rootId'] !== 'string' || raw['rootId'] === '') {
    errors.push(e('tree.rootId', 'must be a non-empty string'))
  }
  if (!isObject(raw['nodes'])) {
    errors.push(e('tree.nodes', 'must be an object'))
    return fail(errors)
  }

  const nodes = raw['nodes']
  for (const [id, node] of Object.entries(nodes)) {
    const r = validateNode(node, id)
    if (!r.ok) errors.push(...r.errors)
  }

  const rootId = raw['rootId']
  if (typeof rootId === 'string' && rootId !== '' && !nodes[rootId]) {
    errors.push(e('tree.rootId', `node "${rootId}" does not exist in tree.nodes`))
  }

  if (errors.length > 0) return fail(errors)
  return pass(raw as unknown as DocumentTree)
}

export function validateEnvelope(raw: unknown): ValidationResult<DocumentEnvelope> {
  if (!isObject(raw)) {
    return fail([e('envelope', 'must be an object')])
  }

  const errors: ValidationError[] = []

  if (typeof raw['version'] !== 'number' || !Number.isInteger(raw['version'])) {
    errors.push(e('version', 'must be an integer'))
  }
  if (!isObject(raw['meta'])) {
    errors.push(e('meta', 'must be an object'))
  }

  const treeResult = validateTree(raw['tree'])
  if (!treeResult.ok) errors.push(...treeResult.errors)

  if (errors.length > 0) return fail(errors)
  return pass(raw as unknown as DocumentEnvelope)
}
