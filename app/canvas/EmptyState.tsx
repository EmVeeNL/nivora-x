export function EmptyState() {
  return (
    <div
      data-testid="canvas-empty-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 320,
        margin: '2rem',
        color: '#9ca3af',
        fontSize: '0.8125rem',
        border: '2px dashed #e5e7eb',
        borderRadius: '0.5rem',
        gap: '0.5rem',
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: '1.5rem' }}>＋</span>
      <span>Drop elements here to start building</span>
    </div>
  )
}
