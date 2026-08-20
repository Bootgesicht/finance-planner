import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AnalyticsLineChart from './AnalyticsLineChart'

const chartConfigs = vi.hoisted(() => [])

vi.mock('chart.js/auto', () => ({
    default: class ChartMock {
        constructor(_canvas, config) {
            chartConfigs.push(config)
        }

        destroy() {}
    }
}))

describe('AnalyticsLineChart', () => {
    beforeEach(() => {
        chartConfigs.length = 0
    })

    it('uses null gaps instead of artificial zeroes before or between person data', () => {
        render(<AnalyticsLineChart ariaLabel="Einnahmentrend" series={[
            {
                id: 'person-1',
                label: 'Jonas',
                points: [
                    { month: '2026-01', amount: 100 },
                    { month: '2026-03', amount: 300 }
                ]
            },
            {
                id: 'person-2',
                label: 'Annina',
                points: [{ month: '2026-03', amount: 200 }]
            }
        ]} />)

        const config = chartConfigs[0]
        expect(config.type).toBe('line')
        expect(config.data.labels).toEqual(['2026-01', '2026-02', '2026-03'])
        expect(config.data.datasets[0].data).toEqual([100, null, 300])
        expect(config.data.datasets[1].data).toEqual([null, null, 200])
        expect(config.data.datasets[0].spanGaps).toBe(false)
        expect(config.data.datasets[0].tension).toBe(0)
    })
})
