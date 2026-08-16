export const ANALYTICS_CHART_COLORS = [
    '#0d6efd',
    '#dc3545',
    '#198754',
    '#ffc107',
    '#6f42c1',
    '#fd7e14',
    '#20c997',
    '#d63384',
    '#6c757d',
    '#0dcaf0'
]

export function getAnalyticsChartColor(index) {
    return ANALYTICS_CHART_COLORS[index % ANALYTICS_CHART_COLORS.length]
}
