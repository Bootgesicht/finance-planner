const API_BASE_URL = 'http://localhost:8080'

export async function getSubcategoriesByCategoryId(categoryId) {
    const response = await fetch(`${API_BASE_URL}/subcategories/category/${categoryId}`)

    if (!response.ok) {
        throw new Error('Failed to fetch subcategories')
    }

    return response.json()
}