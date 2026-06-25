import { getBootstrapData } from '@/lib/bootstrap'
import type { BreakpointConfig } from './config'

interface BreakpointSettingsResponse {
  breakpoints: BreakpointConfig[]
}

function bootstrap() {
  const bs = getBootstrapData()
  if (!bs) throw new Error('nivoraxBootstrap is not defined')
  return bs
}

function restHeaders(): Record<string, string> {
  return { 'X-WP-Nonce': bootstrap().restNonce }
}

function endpoint(): string {
  return `${bootstrap().restRoot}nivorax/v1/settings/breakpoints`
}

export async function saveBreakpoints(
  breakpoints: BreakpointConfig[],
): Promise<BreakpointSettingsResponse> {
  const resp = await fetch(endpoint(), {
    method: 'PUT',
    headers: { ...restHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ breakpoints }),
  })
  if (!resp.ok) throw new Error(`saveBreakpoints: HTTP ${resp.status}`)
  return (await resp.json()) as BreakpointSettingsResponse
}
