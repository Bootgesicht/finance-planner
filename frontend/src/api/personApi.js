const API_BASE_URL = 'http://localhost:8080'

export async function getPersons() {
    const response = await fetch(`${API_BASE_URL}/persons`)

    if (!response.ok) {
        throw new Error('Failed to fetch persons')
    }

    return response.json()
}