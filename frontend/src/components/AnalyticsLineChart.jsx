import { useEffect, useMemo, useRef } from 'react'
import Chart from 'chart.js/auto'
import { getAnalyticsChartColor } from './analyticsChartColors'
import { createMonthLabels, formatTrendMonth } from './analyticsTrendUtils'
import './AnalyticsLineChart.css'

function formatCurrency(amount) {
    return Number(amount || 0).toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR'
    })
}

function AnalyticsLineChart({ series, ariaLabel }) {
    const canvasRef = useRef(null)
    const labels = useMemo(() => createMonthLabels(series), [series])

    useEffect(() => {
        if (!canvasRef.current || labels.length === 0) return undefined

        const datasets = series.map((item, index) => {
            const valuesByMonth = new Map(item.points.map(point => [point.month, Number(point.amount)]))
            const color = getAnalyticsChartColor(index)

            return {
                label: item.label,
                data: labels.map(month => valuesByMonth.has(month) ? valuesByMonth.get(month) : null),
                borderColor: color,
                backgroundColor: color,
                borderWidth: 2,
                pointRadius: labels.length > 60 ? 1.5 : 3,
                pointHoverRadius: 5,
                spanGaps: false,
                tension: 0
            }
        })

        const chart = new Chart(canvasRef.current, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: {
                        display: series.length > 1,
                        position: 'bottom',
                        labels: { usePointStyle: true }
                    },
                    tooltip: {
                        callbacks: {
                            title(context) {
                                return context.length > 0 ? formatTrendMonth(context[0].label) : ''
                            },
                            label(context) {
                                if (context.raw == null) return null
                                return `${context.dataset.label}: ${formatCurrency(context.raw)}`
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 12,
                            maxRotation: 0,
                            callback(_value, index) {
                                return formatTrendMonth(labels[index])
                            }
                        },
                        grid: { display: false }
                    },
                    y: {
                        ticks: {
                            callback(value) {
                                return Number(value).toLocaleString('de-DE', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0
                                })
                            }
                        }
                    }
                }
            }
        })

        return () => chart.destroy()
    }, [labels, series])

    return (
        <div className="analytics-line-chart-container">
            <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />
        </div>
    )
}

export default AnalyticsLineChart
