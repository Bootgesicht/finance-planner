import { describe, expect, it } from 'vitest'

import { createMonthLabels, filterTrendPoints, getVisibleTrend } from './analyticsTrendUtils'

function createMonthlyPoints(startYear, startMonth, count) {
    return Array.from({ length: count }, (_, index) => {
        const monthIndex = (startYear * 12) + startMonth - 1 + index
        const year = Math.floor(monthIndex / 12)
        const month = (monthIndex % 12) + 1
        return {
            month: `${year}-${String(month).padStart(2, '0')}`,
            amount: index + 1
        }
    })
}

describe('analyticsTrendUtils', () => {
    it.each([
        ['3y', 36],
        ['5y', 60],
        ['10y', 120],
        ['max', 130]
    ])('limits %s to the expected number of calendar months', (range, expectedLength) => {
        const points = createMonthlyPoints(2015, 1, 130)

        expect(filterTrendPoints(points, range, '2025-10')).toHaveLength(expectedLength)
    })

    it('keeps person histories sparse and removes series without data in the selected window', () => {
        const trend = {
            lastMonth: '2026-03',
            total: createMonthlyPoints(2022, 1, 51),
            persons: [
                { id: 'person-1', name: 'Jonas', points: [{ month: '2022-01', amount: 100 }] },
                { id: 'person-2', name: 'Annina', points: [{ month: '2026-01', amount: 200 }] }
            ]
        }

        const visible = getVisibleTrend(trend, '3y')

        expect(visible.total).toHaveLength(36)
        expect(visible.persons).toHaveLength(1)
        expect(visible.persons[0].name).toBe('Annina')
        expect(visible.persons[0].points).toEqual([{ month: '2026-01', amount: 200 }])
    })

    it('creates missing calendar months as labels without inventing values', () => {
        const labels = createMonthLabels([{
            id: 'person-1',
            points: [
                { month: '2026-01', amount: 100 },
                { month: '2026-03', amount: 300 }
            ]
        }])

        expect(labels).toEqual(['2026-01', '2026-02', '2026-03'])
    })
})
