import { apiRequest } from './apiClient'

export function getSubcategories(includeArchived = false) {
    const suffix = includeArchived ? '?includeArchived=true' : ''
    return apiRequest(`/subcategories${suffix}`)
}

export function getSubcategoriesByCategoryId(categoryId, includeArchived = false) {
    const suffix = includeArchived ? '?includeArchived=true' : ''
    return apiRequest(`/subcategories/category/${categoryId}${suffix}`)
}

export function createSubcategory(subcategory) {
    return apiRequest('/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subcategory)
    })
}

export function renameSubcategory(id, name) {
    return apiRequest(`/subcategories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
}

export const archiveSubcategory = id => apiRequest(`/subcategories/${id}/archive`, { method: 'PUT' })
export const reactivateSubcategory = id => apiRequest(`/subcategories/${id}/reactivate`, { method: 'PUT' })
export const getSubcategoryDeletionImpact = id => apiRequest(`/subcategories/${id}/deletion-impact`)
export const deleteSubcategory = id => apiRequest(`/subcategories/${id}`, { method: 'DELETE' })
