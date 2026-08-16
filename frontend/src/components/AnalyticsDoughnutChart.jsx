import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import { getAnalyticsChartColor } from './analyticsChartColors'

function formatCurrency(amount) {
    return Number(amount || 0).toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR'
    })
}

function AnalyticsDoughnutChart({ items, ariaLabel }) {
    const canvasRef = useRef(null)
    const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0)

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
        <div className="row g-4 align-items-center">
            <div className="col-12 col-lg-7">
                <div className="position-relative mx-auto" style={{ height: '360px', maxWidth: '560px' }}>
                    <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />
                </div>
            </div>
            <div className="col-12 col-lg-5">
                <ul className="list-group list-group-flush" aria-label={`${ariaLabel} – Legende`}>
                    {items.map((item, index) => (
                        <li
                            className="list-group-item d-flex justify-content-between align-items-center gap-3 px-0"
                            key={item.id}
                        >
                            <span className="d-flex align-items-center gap-2">
                                <span
                                    aria-hidden="true"
                                    className="rounded-circle flex-shrink-0"
                                    style={{
                                        backgroundColor: getAnalyticsChartColor(index),
                                        height: '0.8rem',
                                        width: '0.8rem'
                                    }}
                                />
                                {item.label}
                            </span>
                            <span className="fw-semibold text-nowrap">{formatCurrency(item.amount)}</span>
                        </li>
                    ))}
                    <li className="list-group-item d-flex justify-content-between px-0 border-top fw-bold">
                        <span>Gesamt</span>
                        <span>{formatCurrency(total)}</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default AnalyticsDoughnutChart
