export interface BootstrapBreakpoint {
  id: string
  label: string
  width: number
  direction: 'max'
  builtin: boolean
}

export interface BootstrapTemplate {
  type: string
}

export interface NivoraXBootstrap {
  postId: number
  mode: string
  template?: BootstrapTemplate | null
  restRoot: string
  restNonce: string
  adminUrl: string
  pagesUrl: string
  homeUrl: string
  siteName: string
  postTitle?: string
  version: string
  canManageSettings?: boolean
  breakpoints?: BootstrapBreakpoint[]
}

declare global {
  interface Window {
    nivoraxBootstrap?: NivoraXBootstrap
  }
}

export function getBootstrapData(): NivoraXBootstrap | undefined {
  return typeof window !== 'undefined' ? window.nivoraxBootstrap : undefined
}
