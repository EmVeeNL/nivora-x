import './styles/theme.css'
import { EditorLayout } from './shell/EditorLayout'

export function EditorApp() {
  return (
    <div className="nivorax-editor h-screen w-screen overflow-hidden bg-background text-foreground">
      <EditorLayout />
    </div>
  )
}
