import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import AnalyticsAverageCards from './AnalyticsAverageCards'

function createItems(count) {
    return Array.from({ length: count }, (_, index) => ({
        id: `average-${index + 1}`,
        label: `Position ${index + 1}`,
        averagePerMonth: (index + 1) * 10
    }))
}

function renderCards(count) {
    render(
        <AnalyticsAverageCards
            items={createItems(count)}
            heading="Monatlicher Durchschnitt"
            ariaLabel="Test-Durchschnittskacheln"
        />
    )
    return screen.getByLabelText('Test-Durchschnittskacheln')
}

describe('AnalyticsAverageCards', () => {
    it('renders up to nine cards in the shared three-column grid without scrolling', () => {
        const cardArea = renderCards(9)

        expect(cardArea).toHaveAttribute('data-scrollable', 'false')
        expect(cardArea).not.toHaveClass('analytics-average-items--scrollable')
        expect(cardArea.firstElementChild).toHaveClass('row-cols-lg-3')
        expect(within(cardArea).getAllByText(/€ \/ Monat/)).toHaveLength(9)
    })

    it('limits ten or more cards to the central vertical scroll area', () => {
        const cardArea = renderCards(10)

        expect(cardArea).toHaveAttribute('data-scrollable', 'true')
        expect(cardArea).toHaveClass('analytics-average-items--scrollable')
        expect(within(cardArea).getAllByText(/€ \/ Monat/)).toHaveLength(10)
    })
})
