export const TREND_RANGES = [
    { id: '3y', label: '3J', months: 36 },
    { id: '5y', label: '5J', months: 60 },
    { id: '10y', label: '10J', months: 120 },
    { id: 'max', label: 'MAX', months: null }
]

function monthToIndex(month) {
    const [year, monthNumber] = month.split('-').map(Number)
    return (year * 12) + monthNumber - 1
}

function indexToMonth(index) {
    const year = Math.floor(index / 12)
    const month = (index % 12) + 1
    return `${year}-${String(month).padStart(2, '0')}`
}

function sortPoints(points) {
    return [...(Array.isArray(points) ? points : [])]
        .sort((left, right) => left.month.localeCompare(right.month))
}

export function filterTrendPoints(points, range, lastMonth) {
    const sortedPoints = sortPoints(points)
    const selectedRange = TREND_RANGES.find(item => item.id === range)

    if (!selectedRange?.months || !lastMonth) return sortedPoints

    const firstVisibleMonth = indexToMonth(monthToIndex(lastMonth) - selectedRange.months + 1)
    return sortedPoints.filter(point => point.month >= firstVisibleMonth && point.month <= lastMonth)
}

export function getVisibleTrend(trend, range) {
    const total = sortPoints(trend?.total)
    const lastMonth = trend?.lastMonth || total.at(-1)?.month || null
    const visibleTotal = filterTrendPoints(total, range, lastMonth)
    const persons = (Array.isArray(trend?.persons) ? trend.persons : [])
        .map(series => ({
            ...series,
            points: filterTrendPoints(series.points, range, lastMonth)
        }))
        .filter(series => series.points.length > 0)

    return { total: visibleTotal, persons, lastMonth }
}

export function createMonthLabels(series) {
    const months = series.flatMap(item => item.points.map(point => point.month)).sort()
    if (months.length === 0) return []

    const firstMonthIndex = monthToIndex(months[0])
    const lastMonthIndex = monthToIndex(months.at(-1))
    return Array.from(
        { length: lastMonthIndex - firstMonthIndex + 1 },
        (_, offset) => indexToMonth(firstMonthIndex + offset)
    )
}

export function formatTrendMonth(month) {
    const [year, monthNumber] = month.split('-').map(Number)
    return new Date(year, monthNumber - 1, 1).toLocaleDateString('de-DE', {
        month: 'short',
        year: 'numeric'
    })
}
