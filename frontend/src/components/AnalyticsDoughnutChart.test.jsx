import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import AnalyticsDoughnutChart from './AnalyticsDoughnutChart'

vi.mock('chart.js/auto', () => ({
    default: class ChartMock {
        destroy() {}
    }
}))

const chartLabel = 'Testauswertung als Doughnut-Diagramm'

function createItems(count) {
    return Array.from({ length: count }, (_, index) => ({
        id: `item-${index + 1}`,
        label: index === 0
            ? 'Versicherungen – Rechtsschutzversicherung mit langem Namen'
            : `Position ${index + 1}`,
        amount: (index + 1) * 100
    }))
}

function renderChart(itemCount) {
    render(<AnalyticsDoughnutChart items={createItems(itemCount)} ariaLabel={chartLabel} />)
    return screen.getByLabelText(`${chartLabel} – Legendeneinträge`)
}

describe('AnalyticsDoughnutChart legend', () => {
    it('shows fewer than nine items completely without a scroll container', () => {
        const legendItems = renderChart(5)

        expect(within(legendItems).getAllByRole('listitem')).toHaveLength(5)
        expect(legendItems).toHaveAttribute('data-scrollable', 'false')
        expect(legendItems).not.toHaveClass('analytics-doughnut-legend-items--scrollable')
        expect(screen.getByTitle('Versicherungen – Rechtsschutzversicherung mit langem Namen'))
            .toBeInTheDocument()
    })

    it('shows exactly nine items without an unnecessary scrollbar', () => {
        const legendItems = renderChart(9)

        expect(within(legendItems).getAllByRole('listitem')).toHaveLength(9)
        expect(legendItems).toHaveAttribute('data-scrollable', 'false')
        expect(legendItems).not.toHaveClass('analytics-doughnut-legend-items--scrollable')
    })

    it('limits more than nine items while keeping the total outside the scroll area', () => {
        const legendItems = renderChart(10)
        const totalRow = screen.getByLabelText(`${chartLabel} – Gesamt`)

        expect(within(legendItems).getAllByRole('listitem')).toHaveLength(10)
        expect(legendItems).toHaveAttribute('data-scrollable', 'true')
        expect(legendItems).toHaveClass('analytics-doughnut-legend-items--scrollable')
        expect(within(legendItems).queryByText('Gesamt')).not.toBeInTheDocument()
        expect(totalRow).toHaveTextContent('Gesamt')
        expect(totalRow).toHaveTextContent(/5\.500,00/)
        expect(legendItems).not.toContainElement(totalRow)
    })
})
