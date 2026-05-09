const API_BASE_URL = 'http://localhost:8080'

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