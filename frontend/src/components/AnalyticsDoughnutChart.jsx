import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import { getAnalyticsChartColor } from './analyticsChartColors'
import './AnalyticsDoughnutChart.css'

const MAX_VISIBLE_LEGEND_ITEMS = 9

function formatCurrency(amount) {
    return Number(amount || 0).toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR'
    })
}

function AnalyticsDoughnutChart({ items, ariaLabel }) {
    const canvasRef = useRef(null)
    const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const hasScrollableLegend = items.length > MAX_VISIBLE_LEGEND_ITEMS

    useEffect(() => {
        if (!canvasRef.current || items.length === 0) return undefined

        const centerTotalPlugin = {
            id: 'centerTotal',
            afterDraw(chart) {
                const { ctx, chartArea } = chart
                if (!chartArea) return

                const centerX = (chartArea.left + chartArea.right) / 2
                const centerY = (chartArea.top + chartArea.bottom) / 2
                ctx.save()
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillStyle = '#6c757d'
                ctx.font = '14px system-ui'
                ctx.fillText('Gesamt', centerX, centerY - 12)
                ctx.fillStyle = '#212529'
                ctx.font = '600 18px system-ui'
                ctx.fillText(formatCurrency(total), centerX, centerY + 14)
                ctx.restore()
            }
        }

        const chart = new Chart(canvasRef.current, {
            type: 'doughnut',
            data: {
                labels: items.map(item => item.label),
                datasets: [{
                    data: items.map(item => Number(item.amount || 0)),
                    backgroundColor: items.map((_, index) => getAnalyticsChartColor(index)),
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '64%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                const amount = Number(context.raw || 0)
                                const percentage = total > 0 ? (amount / total) * 100 : 0
                                return `${context.label}: ${formatCurrency(amount)} (${percentage.toFixed(1)} %)`
                            }
                        }
                    }
                }
            },
            plugins: [centerTotalPlugin]
        })

        return () => chart.destroy()
    }, [ariaLabel, items, total])

    return (
        <div className="row g-4 align-items-center analytics-doughnut-layout">
            <div className="col-12 col-lg-7">
                <div className="position-relative mx-auto analytics-doughnut-chart-container">
                    <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />
                </div>
            </div>
            <div className="col-12 col-lg-5 analytics-doughnut-legend-column">
                <div
                    aria-label={`${ariaLabel} – Legendeneinträge`}
                    className={`analytics-doughnut-legend-items${
                        hasScrollableLegend ? ' analytics-doughnut-legend-items--scrollable' : ''
                    }`}
                    data-scrollable={hasScrollableLegend}
                >
                    <ul className="list-group list-group-flush mb-0">
                        {items.map((item, index) => (
                            <li
                                className="list-group-item d-flex justify-content-between align-items-center gap-3 px-0 analytics-doughnut-legend-item"
                                key={item.id}
                            >
                                <span className="d-flex align-items-center gap-2 analytics-doughnut-legend-label">
                                    <span
                                        aria-hidden="true"
                                        className="rounded-circle flex-shrink-0 analytics-doughnut-legend-color"
                                        style={{ backgroundColor: getAnalyticsChartColor(index) }}
                                    />
                                    <span className="analytics-doughnut-legend-name" title={item.label}>
                                        {item.label}
                                    </span>
                                </span>
                                <span className="fw-semibold analytics-doughnut-legend-amount">
                                    {formatCurrency(item.amount)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div
                    aria-label={`${ariaLabel} – Gesamt`}
                    className="list-group-item d-flex justify-content-between align-items-center px-0 border-top fw-bold analytics-doughnut-total"
                >
                    <span>Gesamt</span>
                    <span className="text-nowrap">{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsDoughnutChart
