import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import PreRegistrationForm from '../pre-registration-form'

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

// Mock pre-registration action
vi.mock('@/lib/actions/pre-registration', () => ({
  preRegister: vi.fn(),
}))

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('PreRegistrationForm URL Navigation', () => {
  const mockPush = vi.fn()
  const mockReplace = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup router mock
    const mockRouter = {
      push: mockPush,
      replace: mockReplace,
    }
    vi.mocked(useRouter).mockReturnValue(mockRouter as any)
  })

  it('should start at step 1 by default', () => {
    // Mock empty search params
    const mockSearchParams = new URLSearchParams()
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

    render(<PreRegistrationForm />)

    expect(screen.getByText('Étape 1 sur 4: Informations famille')).toBeInTheDocument()
  })

  it('should initialize with step from URL parameter', () => {
    // Mock search params with step=1
    const mockSearchParams = new URLSearchParams('step=1')
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

    render(<PreRegistrationForm />)

    expect(screen.getByText('Étape 1 sur 4: Informations famille')).toBeInTheDocument()
  })

  it('should not allow access to step 2 without valid family data', () => {
    // Mock search params trying to access step 2
    const mockSearchParams = new URLSearchParams('step=2')
    mockSearchParams.get = vi.fn().mockReturnValue('2')
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

    render(<PreRegistrationForm />)

    // Should redirect back to step 1
    expect(mockReplace).toHaveBeenCalledWith('?step=1', { scroll: false })
  })

  it('should update URL when navigating between steps', async () => {
    const mockSearchParams = new URLSearchParams()
    mockSearchParams.get = vi.fn().mockReturnValue(null)
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

    render(<PreRegistrationForm />)

    // Fill required family information
    fireEvent.change(screen.getByLabelText(/nom de famille/i), {
      target: { value: 'Dupont' }
    })
    fireEvent.change(screen.getByLabelText(/prénom du parent/i), {
      target: { value: 'Jean' }
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'jean.dupont@email.com' }
    })
    fireEvent.change(screen.getByLabelText(/téléphone/i), {
      target: { value: '0123456789' }
    })

    // Click next button
    const nextButton = screen.getByRole('button', { name: /suivant/i })
    fireEvent.click(nextButton)

    // Should update URL to step 2
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('?step=2', { scroll: false })
    })
  })

  it('should validate step access based on form data', () => {
    const mockSearchParams = new URLSearchParams()
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

    render(<PreRegistrationForm />)

    // Try to navigate to step 2 without filling required fields
    const nextButton = screen.getByRole('button', { name: /suivant/i })
    fireEvent.click(nextButton)

    // Should show validation error (form validation will prevent navigation)
    expect(screen.getByText('Étape 1 sur 4: Informations famille')).toBeInTheDocument()
  })

  it('should allow navigation back to previous steps', async () => {
    const mockSearchParams = new URLSearchParams()
    mockSearchParams.get = vi.fn().mockReturnValue(null)
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

    render(<PreRegistrationForm />)

    // Fill form and navigate to step 2
    fireEvent.change(screen.getByLabelText(/nom de famille/i), {
      target: { value: 'Dupont' }
    })
    fireEvent.change(screen.getByLabelText(/prénom du parent/i), {
      target: { value: 'Jean' }
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'jean.dupont@email.com' }
    })
    fireEvent.change(screen.getByLabelText(/téléphone/i), {
      target: { value: '0123456789' }
    })

    fireEvent.click(screen.getByRole('button', { name: /suivant/i }))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('?step=2', { scroll: false })
    })

    // Now click back button
    const backButton = screen.getByRole('button', { name: /retour/i })
    fireEvent.click(backButton)

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('?step=1', { scroll: false })
    })
  })

  it('should preserve form data when refreshing page', () => {
    // Mock search params with step=1
    const mockSearchParams = new URLSearchParams('step=1')
    mockSearchParams.get = vi.fn().mockReturnValue('1')
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

    render(<PreRegistrationForm />)

    // Component should initialize with step 1
    expect(screen.getByText('Étape 1 sur 4: Informations famille')).toBeInTheDocument()
  })

  it('should handle invalid step parameters', () => {
    // Mock search params with invalid step
    const mockSearchParams = new URLSearchParams('step=99')
    mockSearchParams.get = vi.fn().mockReturnValue('99')
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

    render(<PreRegistrationForm />)

    // Should fallback to step 1
    expect(screen.getByText('Étape 1 sur 4: Informations famille')).toBeInTheDocument()
  })
})