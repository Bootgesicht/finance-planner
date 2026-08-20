import { useMemo, useState } from 'react'
import AnalyticsLineChart from './AnalyticsLineChart'
import { getVisibleTrend, TREND_RANGES } from './analyticsTrendUtils'

function AnalyticsTrendSection({
    id,
    title,
    trend,
    allowPersonMode = false,
    loading = false,
    errorMessage = ''
}) {
    const [range, setRange] = useState('3y')
    const [mode, setMode] = useState('total')
    const visibleTrend = useMemo(() => getVisibleTrend(trend, range), [range, trend])
    const chartSeries = mode === 'persons'
        ? visibleTrend.persons.map(series => ({
            id: series.id,
            label: series.name,
            points: series.points
        }))
        : [{ id: 'total', label: 'Gesamt', points: visibleTrend.total }]
    const hasData = chartSeries.some(series => series.points.length > 0)
    const chartAriaLabel = `${title} ${mode === 'persons' ? 'nach Personen' : 'gesamt'} als Liniendiagramm`

    return (
        <section id={id} className="card mt-4 analytics-section">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                    <div>
                        <h5 className="card-title mb-1">{title}</h5>
                        <p className="text-muted mb-0">Monatliche Werte aus der vollständigen Datenhistorie.</p>
                    </div>
                    <div className="d-flex flex-wrap justify-content-end gap-2">
                        <div className="btn-group btn-group-sm" role="group" aria-label={`${title}: Zeitraum`}>
                            {TREND_RANGES.map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`btn ${range === item.id ? 'btn-primary' : 'btn-outline-primary'}`}
                                    aria-pressed={range === item.id}
                                    onClick={() => setRange(item.id)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        {allowPersonMode && (
                            <div className="btn-group btn-group-sm" role="group"
                                aria-label="Einnahmenentwicklung darstellen als">
                                <button type="button"
                                    className={`btn ${mode === 'total' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    aria-pressed={mode === 'total'} onClick={() => setMode('total')}>
                                    Gesamt
                                </button>
                                <button type="button"
                                    className={`btn ${mode === 'persons' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    aria-pressed={mode === 'persons'} onClick={() => setMode('persons')}>
                                    Personen
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <p className="text-muted mb-0" role="status">Langzeitentwicklung wird geladen …</p>
                ) : errorMessage ? (
                    <div className="alert alert-danger mb-0" role="alert">{errorMessage}</div>
                ) : hasData ? (
                    <AnalyticsLineChart series={chartSeries} ariaLabel={chartAriaLabel} />
                ) : (
                    <p className="text-muted mb-0">
                        Für diese Ansicht sind noch keine langfristigen Monatsdaten vorhanden.
                    </p>
                )}
            </div>
        </section>
    )
}

export default AnalyticsTrendSection
