import { getAnalyticsChartColor } from './analyticsChartColors'
import './AnalyticsAverageCards.css'

const MAX_VISIBLE_AVERAGE_CARDS = 9

function formatAmount(amount) {
    return Number(amount || 0).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

function AnalyticsAverageCards({ items, heading, ariaLabel }) {
    if (items.length === 0) return null

    const hasScrollableCards = items.length > MAX_VISIBLE_AVERAGE_CARDS

    return (
        <div className="border-top mt-4 pt-4 analytics-average-section">
            <h6 className="mb-3">{heading}</h6>
            <div
                aria-label={ariaLabel}
                className={`analytics-average-items${
                    hasScrollableCards ? ' analytics-average-items--scrollable' : ''
                }`}
                data-scrollable={hasScrollableCards}
            >
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3 analytics-average-grid">
                    {items.map((item, index) => (
                        <div className="col" key={item.id}>
                            <div
                                className="card analytics-average-card"
                                style={{ borderColor: getAnalyticsChartColor(index) }}
                            >
                                <div className="card-body py-3">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <span
                                            className="rounded-circle flex-shrink-0 analytics-average-color"
                                            aria-hidden="true"
                                            style={{ backgroundColor: getAnalyticsChartColor(index) }}
                                        />
                                        <span className="fw-semibold analytics-average-name" title={item.label}>
                                            {item.label}
                                        </span>
                                    </div>
                                    <span className="text-muted text-nowrap">
                                        Ø {formatAmount(item.averagePerMonth)} € / Monat
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AnalyticsAverageCards
