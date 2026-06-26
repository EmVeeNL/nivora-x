export interface WordPressAttachment {
  url?: string
}

interface WordPressMediaSelection {
  first(): { toJSON(): WordPressAttachment }
}

interface WordPressMediaFrame {
  on(event: 'select', callback: () => void): void
  state(): { get(name: 'selection'): WordPressMediaSelection }
  open(): void
}

interface WordPressMediaOptions {
  title: string
  button: { text: string }
  library?: { type: string }
  multiple?: boolean
}

interface WordPressWindow extends Window {
  wp?: {
    media?: (options: WordPressMediaOptions) => WordPressMediaFrame
  }
}

export function openWordPressImagePicker(
  onSelect: (attachment: WordPressAttachment) => void,
): void {
  const wpWindow = window as WordPressWindow
  const media = wpWindow.wp?.media
  if (!media) return

  const frame = media({
    title: 'Select image',
    button: { text: 'Use image' },
    library: { type: 'image' },
    multiple: false,
  })

  frame.on('select', () => {
    const attachment = frame.state().get('selection').first().toJSON()
    onSelect(attachment)
  })

  frame.open()
}
