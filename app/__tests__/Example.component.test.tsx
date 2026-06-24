import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>
}

describe('Greeting component', () => {
  it('renders the name', () => {
    render(<Greeting name="NivoraX" />)
    expect(screen.getByRole('heading', { name: /NivoraX/i })).toBeInTheDocument()
  })
})
