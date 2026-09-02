import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { bootstrapAuthentication, login, logout } from './api/authApi'
import App from './App'

vi.mock('./api/authApi', () => ({
    bootstrapAuthentication: vi.fn(),
    login: vi.fn(),
    logout: vi.fn()
}))
vi.mock('./api/entryApi', () => ({
    getLatestEntries: vi.fn().mockResolvedValue([])
}))

describe('authentication flow', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        logout.mockResolvedValue()
    })

    it('protects the application and allows login and logout', async () => {
        bootstrapAuthentication.mockResolvedValue(null)
        login.mockResolvedValue({ id: 1, username: 'jonas', displayName: 'Jonas' })

        render(<App />)
        expect(await screen.findByRole('heading', { name: 'Finance Planner' })).toBeInTheDocument()
        expect(screen.queryByText('Neue Einträge')).not.toBeInTheDocument()

        fireEvent.change(screen.getByLabelText('Benutzername'), { target: { value: 'jonas' } })
        fireEvent.change(screen.getByLabelText('Passwort'), { target: { value: 'richtig' } })
        fireEvent.click(screen.getByRole('button', { name: 'Anmelden' }))

        expect(await screen.findByText('Family Finance Planner')).toBeInTheDocument()
        expect(screen.getByText('Jonas')).toBeInTheDocument()
        expect(login).toHaveBeenCalledWith('jonas', 'richtig')

        fireEvent.click(screen.getByRole('button', { name: 'Abmelden' }))
        await waitFor(() => expect(logout).toHaveBeenCalled())
        expect(await screen.findByRole('button', { name: 'Anmelden' })).toBeInTheDocument()
    })

    it('restores an existing server session on startup', async () => {
        bootstrapAuthentication.mockResolvedValue({ id: 2, username: 'annina', displayName: 'Annina' })

        render(<App />)

        expect(await screen.findByText('Family Finance Planner')).toBeInTheDocument()
        expect(screen.getByText('Annina')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Anmelden' })).not.toBeInTheDocument()
    })
})
