import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    getAnalyticsOverview,
    getCategorySummary,
    getMonthlyBalance,
    getPersonSummary,
    getSavingsSummary,
    getSubcategorySummary
} from '../api/analyticsApi'
import AnalyticsPage from './AnalyticsPage'

vi.mock('../api/analyticsApi', () => ({
    getAnalyticsOverview: vi.fn(),
    getCategorySummary: vi.fn(),
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
    { subcategoryId: 1, subcategoryName: 'Strom', categoryId: 1, categoryName: 'Wohnen', totalAmount: 1800 },
    { subcategoryId: 2, subcategoryName: 'Strom', categoryId: 2, categoryName: 'Freizeit', totalAmount: 200 }
]

const persons = [
    { personId: 1, personName: 'Jonas', totalAmount: 2100 },
    { personId: 2, personName: 'Familie', totalAmount: 1400 }
]

const savings = {
    items: [
        { id: 'subcategory-10', name: 'ETF-Sparen', totalAmount: 1600, source: 'BOOKED' },
        { id: 'subcategory-11', name: 'Einzelaktien-Sparen', totalAmount: 700, source: 'BOOKED' },
        { id: 'free-surplus', name: 'Freier Überschuss', totalAmount: 1200, source: 'FREE_SURPLUS' }
    ],
    bookedSavings: 2300,
    freeSurplus: 1200,
    totalAmount: 3500
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

        expect(screen.getByText('Wohnen – Strom')).toBeInTheDocument()
        expect(screen.getByText('Freizeit – Strom')).toBeInTheDocument()
        expect(screen.getByText('Jonas')).toBeInTheDocument()
        expect(screen.getByText('ETF-Sparen')).toBeInTheDocument()
        expect(screen.getByText('Einzelaktien-Sparen')).toBeInTheDocument()
        expect(screen.getByText('Freier Überschuss')).toBeInTheDocument()

        const averageHeading = screen.getByText('Monatlicher Durchschnitt nach Kategorie')
        const averageArea = averageHeading.parentElement
        expect(within(averageArea).getByText('Ø 208,33 € / Monat')).toBeInTheDocument()
        expect(within(averageArea).getByText('Ø 83,33 € / Monat')).toBeInTheDocument()
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
        expect(screen.getByText('ETF-Sparen')).toBeInTheDocument()
    })

    it('shows understandable empty states without rendering broken charts', async () => {
        getAnalyticsOverview.mockResolvedValue({})
        getMonthlyBalance.mockResolvedValue([])
        getCategorySummary.mockResolvedValue([])
        getSubcategorySummary.mockResolvedValue([])
        getPersonSummary.mockResolvedValue([])
        getSavingsSummary.mockResolvedValue(EMPTY_SAVINGS_FIXTURE)

        render(<AnalyticsPage />)
        await screen.findByRole('status')

        expect(screen.getByText('Für den ausgewählten Zeitraum sind keine Ausgaben vorhanden.')).toBeInTheDocument()
        expect(screen.getByText('Für den ausgewählten Zeitraum sind keine Ausgaben nach Subkategorien vorhanden.'))
            .toBeInTheDocument()
        expect(screen.getByText('Für den ausgewählten Zeitraum sind keine personenbezogenen Ausgaben vorhanden.'))
            .toBeInTheDocument()
        expect(screen.getByText('Für den ausgewählten Zeitraum sind keine Sparbeträge vorhanden.'))
            .toBeInTheDocument()
        expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
})

const EMPTY_SAVINGS_FIXTURE = {
    items: [], bookedSavings: 0, freeSurplus: 0, totalAmount: 0
}
