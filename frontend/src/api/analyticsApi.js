const API_BASE_URL = 'http://localhost:8080'

export async function getMonthlyBalance(year) {
    const response = await fetch(`${API_BASE_URL}/analytics/monthly-balance?year=${year}`)

    if (!response.ok) {
        throw new Error('Failed to fetch monthly balance')
    }

    return response.json()
}

export async function getCategorySummary(year, month, kind = 'EXPENSE') {
    const params = new URLSearchParams()

    params.append('year', year)

    if (month) {
        params.append('month', month)
    }

    if (kind) {
        params.append('kind', kind)
    }

    const response = await fetch(`${API_BASE_URL}/analytics/category-summary?${params.toString()}`)

    if (!response.ok) {
        throw new Error('Failed to fetch category summary')
    }

    return response.json()
}