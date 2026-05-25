const API_BASE_URL = 'http://localhost:8080'

export async function getMonthlyBalance(year) {
    const response = await fetch(`${API_BASE_URL}/analytics/monthly-balance?year=${year}`)

    if (!response.ok) {
        throw new Error('Failed to fetch monthly balance')
    }

    return response.json()
}