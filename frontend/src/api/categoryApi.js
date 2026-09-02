import { apiRequest } from './apiClient'

export function getCategories(includeArchived = false) {
    const suffix = includeArchived ? '?includeArchived=true' : ''
    return apiRequest(`/categories${suffix}`)
}

export function createCategory(category) {
    return apiRequest('/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
    })
}

export function renameCategory(id, name) {
    return apiRequest(`/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
}

export const archiveCategory = id => apiRequest(`/categories/${id}/archive`, { method: 'PUT' })
export const reactivateCategory = id => apiRequest(`/categories/${id}/reactivate`, { method: 'PUT' })
export const getCategoryDeletionImpact = id => apiRequest(`/categories/${id}/deletion-impact`)
export const deleteCategory = id => apiRequest(`/categories/${id}`, { method: 'DELETE' })
