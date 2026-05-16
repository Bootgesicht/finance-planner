const API_BASE_URL = 'http://localhost:8080'

export async function getEntries() {
    const response = await fetch(`${API_BASE_URL}/entries`)

    if (!response.ok) {
        throw new Error('Failed to fetch entries')
    }

    return response.json()
}

export async function getLatestEntries(limit = 15) {
    const response = await fetch(`${API_BASE_URL}/entries/latest?limit=${limit}`)

    if (!response.ok) {
        throw new Error('Failed to fetch latest entries')
    }

    return response.json()
}

export async function createEntry(entry) {
    const response = await fetch(`${API_BASE_URL}/entries`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
    })

    if (!response.ok) {
        throw new Error('Failed to create entry')
    }
}

export async function searchEntries(filters) {
    const params = new URLSearchParams()

    if (filters.startDate) {
        params.append('startDate', filters.startDate)
    }

    if (filters.endDate) {
        params.append('endDate', filters.endDate)
    }

    if (filters.personId) {
        params.append('personId', filters.personId)
    }

    if (filters.categoryId) {
        params.append('categoryId', filters.categoryId)
    }

    if (filters.subcategoryId) {
        params.append('subcategoryId', filters.subcategoryId)
    }

    if (filters.description) {
        params.append('description', filters.description)
    }

    const response = await fetch(`${API_BASE_URL}/entries/search?${params.toString()}`)

    if (!response.ok) {
        throw new Error('Failed to search entries')
    }

    return response.json()
}

export async function deleteEntry(id) {
    const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
        method: 'DELETE'
    })

    if (!response.ok) {
        throw new Error('Failed to delete entry')
    }
}

export async function updateEntry(id, entry) {
    const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
    })

    if (!response.ok) {
        throw new Error('Failed to update entry')
    }
}