import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    archiveCategory,
    deleteCategory,
    getCategories,
    getCategoryDeletionImpact,
    reactivateCategory,
    renameCategory
} from '../api/categoryApi'
import {
    archiveSubcategory,
    deleteSubcategory,
    getSubcategories,
    getSubcategoryDeletionImpact,
    reactivateSubcategory,
    renameSubcategory
} from '../api/subcategoryApi'
import { getPersons } from '../api/personApi'
import ManagementPage from './ManagementPage'

vi.mock('../api/personApi', () => ({
    getPersons: vi.fn(),
    createPerson: vi.fn()
}))

vi.mock('../api/categoryApi', () => ({
    archiveCategory: vi.fn(),
    createCategory: vi.fn(),
    deleteCategory: vi.fn(),
    getCategories: vi.fn(),
    getCategoryDeletionImpact: vi.fn(),
    reactivateCategory: vi.fn(),
    renameCategory: vi.fn()
}))

vi.mock('../api/subcategoryApi', () => ({
    archiveSubcategory: vi.fn(),
    createSubcategory: vi.fn(),
    deleteSubcategory: vi.fn(),
    getSubcategories: vi.fn(),
    getSubcategoryDeletionImpact: vi.fn(),
    reactivateSubcategory: vi.fn(),
    renameSubcategory: vi.fn()
}))

const categories = [
    { categoryId: 1, categoryName: 'Wohnen', categoryKind: 'EXPENSE', archived: false },
    { categoryId: 2, categoryName: 'Alte Kategorie', categoryKind: 'EXPENSE', archived: true },
    { categoryId: 3, categoryName: 'Test', categoryKind: 'EXPENSE', archived: false }
]

const subcategories = [
    { id: 10, categoryId: 1, name: 'Strom', archived: false },
    { id: 11, categoryId: 1, name: 'Alter Tarif', archived: true }
]

describe('ManagementPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getPersons.mockResolvedValue([{ personId: 1, personName: 'Familie', personRole: 'HOUSEHOLD' }])
        getCategories.mockResolvedValue(categories)
        getSubcategories.mockResolvedValue(subcategories)
        archiveCategory.mockResolvedValue()
        reactivateCategory.mockResolvedValue()
        renameCategory.mockResolvedValue()
        deleteCategory.mockResolvedValue()
        archiveSubcategory.mockResolvedValue()
        reactivateSubcategory.mockResolvedValue()
        renameSubcategory.mockResolvedValue()
        deleteSubcategory.mockResolvedValue()
    })

    it('uses vertical sections, loads all master data and focuses on active rows by default', async () => {
        render(<ManagementPage />)

        expect(await screen.findByRole('heading', { name: 'Personen' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Kategorien' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Subkategorien' })).toBeInTheDocument()
        expect(getCategories).toHaveBeenCalledWith(true)
        expect(getSubcategories).toHaveBeenCalledWith(true)
        expect(screen.getAllByText('Wohnen').length).toBeGreaterThanOrEqual(2)
        expect(screen.queryByText('Alte Kategorie')).not.toBeInTheDocument()
        expect(screen.queryByText('Alter Tarif')).not.toBeInTheDocument()

        fireEvent.click(screen.getByLabelText('Archivierte anzeigen'))

        expect(screen.getByText('Alte Kategorie')).toBeInTheDocument()
        expect(screen.getByText('Alter Tarif')).toBeInTheDocument()
        expect(screen.getAllByText('Archiviert').length).toBeGreaterThanOrEqual(2)

        const categoryForNewSubcategory = screen.getByLabelText('Kategorie', {
            selector: '#new-subcategory-category'
        })
        expect(within(categoryForNewSubcategory).queryByRole('option', { name: /Alte Kategorie/ }))
            .not.toBeInTheDocument()
    })

    it('renames archived subcategories and can reactivate them without changing their identity', async () => {
        render(<ManagementPage />)
        await screen.findAllByText('Wohnen')
        fireEvent.click(screen.getByLabelText('Archivierte anzeigen'))

        const archivedRow = screen.getByText('Alter Tarif').closest('tr')
        fireEvent.click(within(archivedRow).getByRole('button', { name: 'Bearbeiten' }))
        fireEvent.change(screen.getByLabelText('Neuer Name'), { target: { value: 'Neuer Tarif' } })
        fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))

        await waitFor(() => expect(renameSubcategory).toHaveBeenCalledWith(11, 'Neuer Tarif'))

        fireEvent.click(within(archivedRow).getByRole('button', { name: 'Reaktivieren' }))
        await waitFor(() => expect(reactivateSubcategory).toHaveBeenCalledWith(11))
    })

    it('offers archiving instead of deletion while a subcategory is still used', async () => {
        getSubcategoryDeletionImpact.mockResolvedValue({
            deletable: false,
            subcategoryCount: 0,
            entryCount: 184,
            reason: 'Diese Subkategorie wird noch von 184 Einträgen verwendet.'
        })
        render(<ManagementPage />)
        const row = (await screen.findByText('Strom')).closest('tr')

        fireEvent.click(within(row).getByRole('button', { name: 'Löschen' }))

        expect(await screen.findByText(/184 Einträgen/)).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Endgültig löschen' })).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Stattdessen archivieren' }))

        await waitFor(() => expect(archiveSubcategory).toHaveBeenCalledWith(10))
        expect(deleteSubcategory).not.toHaveBeenCalled()
    })

    it('hard-deletes only after dependency check and explicit confirmation', async () => {
        getCategoryDeletionImpact.mockResolvedValue({
            deletable: true,
            subcategoryCount: 0,
            entryCount: 0,
            reason: null
        })
        render(<ManagementPage />)
        const row = (await screen.findByText('Test')).closest('tr')

        fireEvent.click(within(row).getByRole('button', { name: 'Löschen' }))
        expect(deleteCategory).not.toHaveBeenCalled()
        fireEvent.click(await screen.findByRole('button', { name: 'Endgültig löschen' }))

        await waitFor(() => expect(deleteCategory).toHaveBeenCalledWith(3))
    })
})
