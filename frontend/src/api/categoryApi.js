const API_BASE_URL = 'http://localhost:8080'

async function request(path, options) {
    const response = await fetch(`${API_BASE_URL}${path}`, options)

    if (!response.ok) {
        let message = 'Kategorie-Aktion fehlgeschlagen.'
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

export function getCategories(includeArchived = false) {
    const suffix = includeArchived ? '?includeArchived=true' : ''
    return request(`/categories${suffix}`)
}

export function createCategory(category) {
    return request('/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
    })
}

export function renameCategory(id, name) {
    return request(`/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
}

export function archiveCategory(id) {
    return request(`/categories/${id}/archive`, { method: 'PUT' })
}

export function reactivateCategory(id) {
    return request(`/categories/${id}/reactivate`, { method: 'PUT' })
}

export function getCategoryDeletionImpact(id) {
    return request(`/categories/${id}/deletion-impact`)
}

export function deleteCategory(id) {
    return request(`/categories/${id}`, { method: 'DELETE' })
}
