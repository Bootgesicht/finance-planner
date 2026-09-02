import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCategories } from '../api/categoryApi'
import { getSubcategoriesByCategoryId } from '../api/subcategoryApi'
import { searchEntries, updateEntry } from '../api/entryApi'
import { getPersons } from '../api/personApi'
import { getUsers } from '../api/userApi'
import EntriesPage from './EntriesPage'

vi.mock('../api/personApi', () => ({ getPersons: vi.fn() }))
vi.mock('../api/categoryApi', () => ({ getCategories: vi.fn() }))
vi.mock('../api/subcategoryApi', () => ({ getSubcategoriesByCategoryId: vi.fn() }))
vi.mock('../api/entryApi', () => ({
    searchEntries: vi.fn(),
    deleteEntry: vi.fn(),
    updateEntry: vi.fn()
}))
vi.mock('../api/userApi', () => ({ getUsers: vi.fn() }))

const categories = [
    { categoryId: 10, categoryName: 'Alt', categoryKind: 'EXPENSE', archived: true },
    { categoryId: 20, categoryName: 'Neu', categoryKind: 'EXPENSE', archived: false },
    { categoryId: 30, categoryName: 'Anderes Archiv', categoryKind: 'EXPENSE', archived: true }
]

const entry = {
    id: 4,
    date: '2025-01-15',
    amount: 20,
    description: 'Historisch',
    note: '',
    personId: 1,
    personName: 'Familie',
    categoryId: 10,
    categoryName: 'Alt',
    categoryKind: 'EXPENSE',
    subcategoryId: 101,
    subcategoryName: 'Alter Tarif',
    createdByUserId: 7,
    createdByDisplayName: 'Jonas'
}

describe('EntriesPage archive behavior', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getPersons.mockResolvedValue([{ personId: 1, personName: 'Familie' }])
        getUsers.mockResolvedValue([{ id: 7, username: 'jonas', displayName: 'Jonas' }])
        getCategories.mockResolvedValue(categories)
        searchEntries.mockResolvedValue([entry])
        updateEntry.mockResolvedValue()
        getSubcategoriesByCategoryId.mockImplementation((categoryId, includeArchived) => {
            if (Number(categoryId) === 10 && includeArchived) {
                return Promise.resolve([
                    { id: 101, categoryId: 10, name: 'Alter Tarif', archived: true },
                    { id: 102, categoryId: 10, name: 'Weitere alte Auswahl', archived: false }
                ])
            }
            return Promise.resolve([
                { id: 201, categoryId: 20, name: 'Neue Struktur', archived: false }
            ])
        })
    })

    it('keeps archived values in filters with a clear label', async () => {
        render(<EntriesPage />)
        await screen.findByText('Historisch')

        expect(getCategories).toHaveBeenCalledWith(true)
        const filters = screen.getAllByRole('combobox')
        const categoryFilter = filters[1]
        expect(within(categoryFilter).getByRole('option', { name: 'Alt (archiviert)' })).toBeInTheDocument()

        fireEvent.change(categoryFilter, { target: { value: '10' } })

        await waitFor(() => expect(getSubcategoriesByCategoryId).toHaveBeenCalledWith('10', true))
        const subcategoryFilter = filters[2]
        expect(await within(subcategoryFilter).findByRole('option', { name: 'Alter Tarif (archiviert)' }))
            .toBeInTheDocument()
    })

    it('shows the current archived structure while offering only active replacements', async () => {
        render(<EntriesPage />)
        const row = (await screen.findByText('Historisch')).closest('tr')
        fireEvent.click(within(row).getByRole('button', { name: 'Bearbeiten' }))

        await waitFor(() => expect(getSubcategoriesByCategoryId).toHaveBeenCalledWith(10, true))
        const selects = within(row).getAllByRole('combobox')
        const categorySelect = selects[1]
        const subcategorySelect = selects[2]

        expect(within(categorySelect).getByRole('option', { name: 'Alt (archiviert)' })).toBeInTheDocument()
        expect(within(categorySelect).getByRole('option', { name: 'Neu' })).toBeInTheDocument()
        expect(within(categorySelect).queryByRole('option', { name: 'Anderes Archiv (archiviert)' }))
            .not.toBeInTheDocument()
        expect(within(subcategorySelect).getByRole('option', { name: 'Alter Tarif (archiviert)' }))
            .toBeInTheDocument()
        expect(within(subcategorySelect).queryByRole('option', { name: 'Weitere alte Auswahl (archiviert)' }))
            .not.toBeInTheDocument()

        fireEvent.change(categorySelect, { target: { value: '20' } })

        await waitFor(() => expect(getSubcategoriesByCategoryId).toHaveBeenCalledWith('20'))
        expect(await within(subcategorySelect).findByRole('option', { name: 'Neue Struktur' }))
            .toBeInTheDocument()
    })

    it('filters independently by the user who created the entry', async () => {
        render(<EntriesPage />)
        await screen.findByText('Historisch')

        const creatorFilter = screen.getAllByRole('combobox')[3]
        expect(within(creatorFilter).getByRole('option', { name: 'Jonas' })).toBeInTheDocument()
        expect(screen.getAllByText('Jonas')).toHaveLength(2)

        fireEvent.change(creatorFilter, { target: { value: '7' } })
        fireEvent.click(screen.getByRole('button', { name: 'Filtern' }))

        await waitFor(() => expect(searchEntries).toHaveBeenLastCalledWith(expect.objectContaining({
            personId: '',
            createdByUserId: '7'
        })))
    })
})
