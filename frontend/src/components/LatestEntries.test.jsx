import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getLatestEntries } from '../api/entryApi'
import LatestEntries from './LatestEntries'

vi.mock('../api/entryApi', () => ({ getLatestEntries: vi.fn() }))

const ownEntry = {
    id: 1,
    date: '2026-08-01',
    amount: 25,
    description: 'Eigener Eintrag',
    personName: 'Annina',
    categoryName: 'Wohnen',
    subcategoryName: 'Strom',
    categoryKind: 'EXPENSE',
    createdByDisplayName: 'Jonas'
}

describe('LatestEntries', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getLatestEntries.mockResolvedValue([ownEntry])
    })

    it('loads only entries created by the current user by default', async () => {
        render(<LatestEntries />)
        expect(await screen.findByText('Eigener Eintrag')).toBeInTheDocument()
        expect(getLatestEntries).toHaveBeenCalledWith(15, 'mine')
        expect(screen.getByText('Jonas')).toBeInTheDocument()
    })

    it('switches to all entries and marks historical creators as unknown', async () => {
        getLatestEntries
            .mockResolvedValueOnce([ownEntry])
            .mockResolvedValueOnce([{ ...ownEntry, id: 2, description: 'Historisch', createdByDisplayName: null }])

        render(<LatestEntries />)
        await screen.findByText('Eigener Eintrag')
        fireEvent.click(screen.getByRole('button', { name: 'Alle' }))

        expect(await screen.findByText('Historisch')).toBeInTheDocument()
        expect(screen.getByText('Unbekannt')).toBeInTheDocument()
        await waitFor(() => expect(getLatestEntries).toHaveBeenLastCalledWith(15, 'all'))
    })
})
