import { apiRequest } from './apiClient'

function createRangeParams(from, to) {
    const params = new URLSearchParams()
    params.append('from', from)
    params.append('to', to)
    return params
}

async function getAnalyticsResponse(path, params) {
    return apiRequest(`/analytics/${path}?${params.toString()}`)
}

export function getAnalyticsOverview(from, to) {
    return getAnalyticsResponse('overview', createRangeParams(from, to))
}

export function getMonthlyBalance(from, to) {
    return getAnalyticsResponse('monthly-balance', createRangeParams(from, to))
}

export function getCategorySummary(from, to, kind = 'EXPENSE') {
    const params = createRangeParams(from, to)

    if (kind) params.append('kind', kind)
    return getAnalyticsResponse('category-summary', params)
}

export function getSubcategorySummary(from, to, kind = 'EXPENSE') {
    const params = createRangeParams(from, to)

    if (kind) params.append('kind', kind)
    return getAnalyticsResponse('subcategory-summary', params)
}

export function getPersonSummary(from, to) {
    return getAnalyticsResponse('person-summary', createRangeParams(from, to))
}

export function getSavingsSummary(from, to) {
    return getAnalyticsResponse('savings-summary', createRangeParams(from, to))
}

export function getIncomeSummary(from, to, groupBy = 'subcategory') {
    const params = createRangeParams(from, to)
    params.append('groupBy', groupBy)
    return getAnalyticsResponse('income-summary', params)
}

export function getLongTermAnalytics() {
    return getAnalyticsResponse('long-term-trends', new URLSearchParams())
}
