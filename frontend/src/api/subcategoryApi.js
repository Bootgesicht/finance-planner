const API_BASE_URL = 'http://localhost:8080'

export async function getSubcategories() {
    const response = await fetch(`${API_BASE_URL}/subcategories`)

    if (!response.ok) {
        throw new Error('Failed to fetch subcategories')
    }

    return response.json()
}

export async function getSubcategoriesByCategoryId(categoryId) {
    const response = await fetch(`${API_BASE_URL}/subcategories/category/${categoryId}`)

    if (!response.ok) {
        throw new Error('Failed to fetch subcategories')
    }

    return response.json()
}

export async function createSubcategory(subcategory) {
    const response = await fetch(`${API_BASE_URL}/subcategories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(subcategory)
    })

    if (!response.ok) {
        throw new Error('Failed to create subcategory')
    }
}