const API_BASE_URL = 'http://localhost:8080'

export async function getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`)

    if (!response.ok) {
        throw new Error('Failed to fetch categories')
    }

    return response.json()
}

export async function createCategory(category) {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(category)
    })

    if (!response.ok) {
        throw new Error('Failed to create category')
    }
}