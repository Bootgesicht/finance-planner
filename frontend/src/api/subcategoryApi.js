const API_BASE_URL = 'http://localhost:8080'

async function request(path, options) {
    const response = await fetch(`${API_BASE_URL}${path}`, options)

    if (!response.ok) {
        let message = 'Subkategorie-Aktion fehlgeschlagen.'
        try {
            const error = await response.json()
            message = error.detail || error.message || message
        } catch {
            // The fallback is intentionally kept for responses without JSON.
        }
        const requestError = new Error(message)
        requestError.status = response.status
        throw requestError
    }

    const responseText = await response.text()
    return responseText ? JSON.parse(responseText) : undefined
}

export function getSubcategories(includeArchived = false) {
    const suffix = includeArchived ? '?includeArchived=true' : ''
    return request(`/subcategories${suffix}`)
}

export function getSubcategoriesByCategoryId(categoryId, includeArchived = false) {
    const suffix = includeArchived ? '?includeArchived=true' : ''
    return request(`/subcategories/category/${categoryId}${suffix}`)
}

export function createSubcategory(subcategory) {
    return request('/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subcategory)
    })
}

export function renameSubcategory(id, name) {
    return request(`/subcategories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
}

export function archiveSubcategory(id) {
    return request(`/subcategories/${id}/archive`, { method: 'PUT' })
}

export function reactivateSubcategory(id) {
    return request(`/subcategories/${id}/reactivate`, { method: 'PUT' })
}

export function getSubcategoryDeletionImpact(id) {
    return request(`/subcategories/${id}/deletion-impact`)
}

export function deleteSubcategory(id) {
    return request(`/subcategories/${id}`, { method: 'DELETE' })
}
