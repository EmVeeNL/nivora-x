import { useDocumentStore } from '@/document/store'

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  height: 24,
  background: '#252525',
  border: '1px solid #333',
  borderRadius: 3,
  color: '#ffffff',
  fontSize: 11,
  padding: '0 6px',
  boxSizing: 'border-box',
  outline: 'none',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#888',
  marginBottom: 4,
}

export function PageSettings() {
  const meta = useDocumentStore((s) => s.documentMeta)
  const update = (nextMeta: Record<string, unknown>) =>
    useDocumentStore.getState().updateDocumentMeta(nextMeta)
  const title = (meta['title'] as string | undefined) ?? 'Untitled Page'
  const slug = (meta['slug'] as string | undefined) ?? ''
  const description = (meta['description'] as string | undefined) ?? ''

  return (
    <div style={{ display: 'grid', gap: 12, padding: 12 }}>
      <label>
        <span style={LABEL_STYLE}>Title</span>
        <input
          value={title}
          aria-label="Page title"
          style={INPUT_STYLE}
          onChange={(e) => update({ title: e.target.value })}
        />
      </label>
      <label>
        <span style={LABEL_STYLE}>Slug</span>
        <input
          value={slug}
          aria-label="Page slug"
          placeholder="page-slug"
          style={INPUT_STYLE}
          onChange={(e) => update({ slug: e.target.value })}
        />
      </label>
      <label>
        <span style={LABEL_STYLE}>Description</span>
        <textarea
          value={description}
          aria-label="Page description"
          style={{ ...INPUT_STYLE, height: 64, padding: '4px 6px', resize: 'vertical' }}
          onChange={(e) => update({ description: e.target.value })}
        />
      </label>
    </div>
  )
}
