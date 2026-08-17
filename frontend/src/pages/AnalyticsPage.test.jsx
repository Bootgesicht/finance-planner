import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    getAnalyticsOverview,
    getCategorySummary,
    getIncomeSummary,
    getMonthlyBalance,
    getPersonSummary,
    getSavingsSummary,
    getSubcategorySummary
} from '../api/analyticsApi'
import AnalyticsPage from './AnalyticsPage'

vi.mock('../api/analyticsApi', () => ({
    getAnalyticsOverview: vi.fn(),
    getCategorySummary: vi.fn(),
    getIncomeSummary: vi.fn(),
    getMonthlyBalance: vi.fn(),
    getPersonSummary: vi.fn(),
    getSavingsSummary: vi.fn(),
    getSubcategorySummary: vi.fn()
}))

vi.mock('chart.js/auto', () => ({
    default: class ChartMock {
        destroy() {}
    }
}))

const overview = {
    income: 7000,
    expenses: 3500,
    savings: 2300,
    balanceBeforeSavings: 3500,
    freeBalanceAfterSavings: 1200
}

const categories = [
    {
        categoryId: 1,
        categoryName: 'Wohnen',
        categoryKind: 'EXPENSE',
        totalAmount: 2500,
        averagePerMonth: 208.33,
        monthCount: 12
    },
    {
        categoryId: 2,
        categoryName: 'Freizeit',
        categoryKind: 'EXPENSE',
        totalAmount: 1000,
        averagePerMonth: 83.33,
        monthCount: 12
    }
]

const subcategories = [
    {
        subcategoryId: 1, subcategoryName: 'Strom', categoryId: 1, categoryName: 'Wohnen',
        totalAmount: 1800, averagePerMonth: 150
    },
    {
        subcategoryId: 2, subcategoryName: 'Strom', categoryId: 2, categoryName: 'Freizeit',
        totalAmount: 200, averagePerMonth: 16.67
    }
]

const persons = [
    { personId: 1, personName: 'Jonas', totalAmount: 2100, averagePerMonth: 175 },
    { personId: 2, personName: 'Familie', totalAmount: 1400, averagePerMonth: 116.67 }
]

const savings = {
    items: [
        {
            id: 'subcategory-10', name: 'ETF-Sparen', totalAmount: 1600,
            averagePerMonth: 133.33, source: 'BOOKED'
        },
        {
            id: 'subcategory-11', name: 'Einzelaktien-Sparen', totalAmount: 700,
            averagePerMonth: 58.33, source: 'BOOKED'
        },
        {
            id: 'free-surplus', name: 'Freier Überschuss', totalAmount: 1200,
            averagePerMonth: 100, source: 'FREE_SURPLUS'
        }
    ],
    bookedSavings: 2300,
    freeSurplus: 1200,
    totalAmount: 3500
}

const incomeByCategory = {
    groupBy: 'category',
    items: [
        { id: 'category-3', name: 'Gehalt', totalAmount: 6600, averagePerMonth: 550 },
        { id: 'category-4', name: 'Geldgeschenke', totalAmount: 400, averagePerMonth: 33.33 }
    ],
    totalAmount: 7000,
    monthCount: 12
}

const incomeByPerson = {
    groupBy: 'person',
    items: [
        { id: 'person-1', name: 'Jonas', totalAmount: 6600, averagePerMonth: 550 },
        { id: 'person-0', name: 'Ohne Person', totalAmount: 400, averagePerMonth: 33.33 }
    ],
    totalAmount: 7000,
    monthCount: 12
}

describe('AnalyticsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getAnalyticsOverview.mockResolvedValue(overview)
        getMonthlyBalance.mockResolvedValue([{
            month: '2026-01', income: 7000, expenses: 3500, savings: 2300,
            balanceBeforeSavings: 3500, freeBalanceAfterSavings: 1200
        }])
        getCategorySummary.mockResolvedValue(categories)
        getSubcategorySummary.mockResolvedValue(subcategories)
        getPersonSummary.mockResolvedValue(persons)
        getSavingsSummary.mockResolvedValue(savings)
        getIncomeSummary.mockImplementation((_from, _to, groupBy) => Promise.resolve(
            groupBy === 'person' ? incomeByPerson : incomeByCategory
        ))
    })

    it('loads every analysis with the current calendar year by default', async () => {
        const year = new Date().getFullYear()
        render(<AnalyticsPage />)

        expect(screen.getByLabelText('Von-Datum')).toHaveValue(`${year}-01-01`)
        expect(screen.getByLabelText('Bis-Datum')).toHaveValue(`${year}-12-31`)

        await waitFor(() => {
            expect(getAnalyticsOverview).toHaveBeenCalledWith(`${year}-01-01`, `${year}-12-31`)
            expect(getMonthlyBalance).toHaveBeenCalledWith(`${year}-01-01`, `${year}-12-31`)
            expect(getCategorySummary).toHaveBeenCalledWith(`${year}-01-01`, `${year}-12-31`, 'EXPENSE')
            expect(getSubcategorySummary).toHaveBeenCalledWith(`${year}-01-01`, `${year}-12-31`, 'EXPENSE')
            expect(getPersonSummary).toHaveBeenCalledWith(`${year}-01-01`, `${year}-12-31`)
            expect(getSavingsSummary).toHaveBeenCalledWith(`${year}-01-01`, `${year}-12-31`)
            expect(getIncomeSummary).toHaveBeenCalledWith(`${year}-01-01`, `${year}-12-31`, 'category')
            expect(getIncomeSummary).toHaveBeenCalledWith(`${year}-01-01`, `${year}-12-31`, 'person')
        })
    })

    it('reloads all existing and new analytics with an edited multi-year range', async () => {
        render(<AnalyticsPage />)
        await screen.findByRole('status')
        vi.clearAllMocks()

        fireEvent.change(screen.getByLabelText('Von-Datum'), { target: { value: '2025-01-15' } })
        fireEvent.change(screen.getByLabelText('Bis-Datum'), { target: { value: '2026-02-20' } })
        fireEvent.click(screen.getByRole('button', { name: 'Auswerten' }))

        await waitFor(() => {
            expect(getSubcategorySummary).toHaveBeenCalledWith('2025-01-15', '2026-02-20', 'EXPENSE')
            expect(getPersonSummary).toHaveBeenCalledWith('2025-01-15', '2026-02-20')
            expect(getSavingsSummary).toHaveBeenCalledWith('2025-01-15', '2026-02-20')
            expect(getIncomeSummary).toHaveBeenCalledWith('2025-01-15', '2026-02-20', 'category')
            expect(getIncomeSummary).toHaveBeenCalledWith('2025-01-15', '2026-02-20', 'person')
        })
        expect(screen.getByText(/Übersicht 15\. Januar 2025 – 20\. Februar 2026/)).toBeInTheDocument()
    })

    it('renders all doughnuts, unique subcategory names, averages and free surplus', async () => {
        render(<AnalyticsPage />)

        expect(await screen.findByRole('img', { name: 'Ausgaben nach Kategorien als Doughnut-Diagramm' }))
            .toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'Ausgaben nach Subkategorien als Doughnut-Diagramm' }))
            .toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'Ausgaben nach Personen als Doughnut-Diagramm' }))
            .toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'Sparen und Investieren als Doughnut-Diagramm' }))
            .toBeInTheDocument()

        expect(screen.getAllByText('Wohnen – Strom')).toHaveLength(2)
        expect(screen.getAllByText('Freizeit – Strom')).toHaveLength(2)
        expect(screen.getAllByText('Jonas').length).toBeGreaterThanOrEqual(2)
        expect(screen.getAllByText('ETF-Sparen')).toHaveLength(2)
        expect(screen.getAllByText('Einzelaktien-Sparen')).toHaveLength(2)
        expect(screen.getAllByText('Freier Überschuss')).toHaveLength(2)

        const averageArea = screen.getByLabelText('Durchschnittsausgaben nach Kategorien')
        expect(within(averageArea).getByText('Ø 208,33 € / Monat')).toBeInTheDocument()
        expect(within(averageArea).getByText('Ø 83,33 € / Monat')).toBeInTheDocument()

        expect(within(screen.getByLabelText('Durchschnittsausgaben nach Subkategorien'))
            .getByText('Ø 150,00 € / Monat')).toBeInTheDocument()
        expect(within(screen.getByLabelText('Durchschnittsausgaben nach Personen'))
            .getByText('Ø 175,00 € / Monat')).toBeInTheDocument()
        expect(within(screen.getByLabelText('Durchschnitt für Sparen und Investieren'))
            .getByText('Ø 100,00 € / Monat')).toBeInTheDocument()
    })

    it('shows one income doughnut and switches categories, persons and their averages together', async () => {
        render(<AnalyticsPage />)

        expect(await screen.findByRole('link', { name: 'Einnahmen' })).toHaveAttribute('href', '#income-summary')
        const categoryButton = screen.getByRole('button', { name: 'Kategorien' })
        const personButton = screen.getByRole('button', { name: 'Personen' })

        expect(categoryButton).toHaveAttribute('aria-pressed', 'true')
        expect(personButton).toHaveAttribute('aria-pressed', 'false')
        expect(screen.getAllByRole('img', { name: /Einnahmen nach .* als Doughnut-Diagramm/ })).toHaveLength(1)
        expect(screen.getByRole('img', { name: 'Einnahmen nach Kategorien als Doughnut-Diagramm' }))
            .toBeInTheDocument()
        expect(screen.getByLabelText('Einnahmen nach Kategorien als Doughnut-Diagramm – Gesamt'))
            .toHaveTextContent(/7\.000,00/)
        expect(within(screen.getByLabelText('Durchschnittseinnahmen nach Kategorien'))
            .getByText('Ø 550,00 € / Monat')).toBeInTheDocument()
        expect(screen.getAllByText('Geldgeschenke')).toHaveLength(2)

        fireEvent.click(personButton)

        expect(personButton).toHaveAttribute('aria-pressed', 'true')
        expect(categoryButton).toHaveAttribute('aria-pressed', 'false')
        expect(screen.queryByRole('img', { name: 'Einnahmen nach Kategorien als Doughnut-Diagramm' }))
            .not.toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'Einnahmen nach Personen als Doughnut-Diagramm' }))
            .toBeInTheDocument()
        expect(screen.getByLabelText('Einnahmen nach Personen als Doughnut-Diagramm – Gesamt'))
            .toHaveTextContent(/7\.000,00/)
        expect(screen.getAllByText('Ohne Person')).toHaveLength(2)
        expect(within(screen.getByLabelText('Durchschnittseinnahmen nach Personen'))
            .getByText('Ø 33,33 € / Monat')).toBeInTheDocument()

        fireEvent.click(categoryButton)

        expect(categoryButton).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByRole('img', { name: 'Einnahmen nach Kategorien als Doughnut-Diagramm' }))
            .toBeInTheDocument()
        expect(screen.queryByText('Ohne Person')).not.toBeInTheDocument()
    })

    it('uses the shared scroll limit for more than nine subcategory averages', async () => {
        getSubcategorySummary.mockResolvedValue(Array.from({ length: 10 }, (_, index) => ({
            subcategoryId: index + 1,
            subcategoryName: `Unterkategorie ${index + 1}`,
            categoryId: 1,
            categoryName: 'Hauptkategorie',
            totalAmount: 1200,
            averagePerMonth: 100
        })))

        render(<AnalyticsPage />)

        const averageArea = await screen.findByLabelText('Durchschnittsausgaben nach Subkategorien')
        expect(averageArea).toHaveClass('analytics-average-items--scrollable')
        expect(averageArea).toHaveAttribute('data-scrollable', 'true')
        expect(within(averageArea).getAllByText('Ø 100,00 € / Monat')).toHaveLength(10)
    })

    it('scrolls only the income average card area when more than nine groups exist', async () => {
        const manyIncomeItems = Array.from({ length: 10 }, (_, index) => ({
            id: `category-${index}`,
            name: `Einnahme ${index + 1}`,
            totalAmount: 1200,
            averagePerMonth: 100
        }))
        getIncomeSummary.mockImplementation((_from, _to, groupBy) => Promise.resolve(
            groupBy === 'person' ? incomeByPerson : { ...incomeByCategory, items: manyIncomeItems }
        ))

        render(<AnalyticsPage />)

        const averageArea = await screen.findByLabelText('Durchschnittseinnahmen nach Kategorien')
        expect(averageArea).toHaveClass('analytics-average-items--scrollable')
        expect(averageArea).toHaveAttribute('data-scrollable', 'true')
        expect(within(averageArea).getAllByText('Ø 100,00 € / Monat')).toHaveLength(10)
    })

    it('does not invent a free-surplus segment when the backend returns no positive surplus', async () => {
        getSavingsSummary.mockResolvedValue({
            items: [{ id: 'subcategory-10', name: 'ETF-Sparen', totalAmount: 2300, source: 'BOOKED' }],
            bookedSavings: 2300,
            freeSurplus: 0,
            totalAmount: 2300
        })

        render(<AnalyticsPage />)
        await screen.findByRole('img', { name: 'Sparen und Investieren als Doughnut-Diagramm' })

        expect(screen.queryByText('Freier Überschuss')).not.toBeInTheDocument()
        expect(screen.getAllByText('ETF-Sparen')).toHaveLength(2)
    })

    it('shows understandable empty states without rendering broken charts', async () => {
        getAnalyticsOverview.mockResolvedValue({})
        getMonthlyBalance.mockResolvedValue([])
        getCategorySummary.mockResolvedValue([])
        getSubcategorySummary.mockResolvedValue([])
        getPersonSummary.mockResolvedValue([])
        getSavingsSummary.mockResolvedValue(EMPTY_SAVINGS_FIXTURE)
        getIncomeSummary.mockResolvedValue({ items: [], totalAmount: 0, monthCount: 12 })

        render(<AnalyticsPage />)
        await screen.findByRole('status')

        expect(screen.getByText('Für den ausgewählten Zeitraum sind keine Ausgaben vorhanden.')).toBeInTheDocument()
        expect(screen.getByText('Für den ausgewählten Zeitraum sind keine Ausgaben nach Subkategorien vorhanden.'))
            .toBeInTheDocument()
        expect(screen.getByText('Für den ausgewählten Zeitraum sind keine personenbezogenen Ausgaben vorhanden.'))
            .toBeInTheDocument()
        expect(screen.getByText('Für den ausgewählten Zeitraum sind keine Sparbeträge vorhanden.'))
            .toBeInTheDocument()
        expect(screen.getByText('Für den ausgewählten Zeitraum sind keine Einnahmen vorhanden.'))
            .toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Personen' }))
        expect(screen.getByText('Für den ausgewählten Zeitraum sind keine personenbezogenen Einnahmen vorhanden.'))
            .toBeInTheDocument()
        expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
})

const EMPTY_SAVINGS_FIXTURE = {
    items: [], bookedSavings: 0, freeSurplus: 0, totalAmount: 0
}
