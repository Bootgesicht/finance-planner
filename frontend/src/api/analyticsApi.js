const API_BASE_URL = 'http://localhost:8080'

function createRangeParams(from, to) {
    const params = new URLSearchParams()
    params.append('from', from)
    params.append('to', to)
    return params
}

async function getAnalyticsResponse(path, params) {
    const response = await fetch(`${API_BASE_URL}/analytics/${path}?${params.toString()}`)

    if (!response.ok) {
        throw new Error(`Failed to fetch analytics endpoint: ${path}`)
    }

    return response.json()
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
