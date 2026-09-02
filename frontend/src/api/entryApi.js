import { apiRequest } from './apiClient'

export function getEntries() {
    return apiRequest('/entries')
}

export function getLatestEntries(limit = 15, scope = 'mine') {
    const params = new URLSearchParams({ limit: String(limit), scope })
    return apiRequest(`/entries/latest?${params.toString()}`)
}

export function createEntry(entry) {
    return apiRequest('/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    })
}

export function searchEntries(filters) {
    const params = new URLSearchParams()
    for (const key of [
        'startDate', 'endDate', 'personId', 'categoryId',
        'subcategoryId', 'description', 'createdByUserId'
    ]) {
        if (filters[key]) params.append(key, filters[key])
    }
    return apiRequest(`/entries/search?${params.toString()}`)
}

export const deleteEntry = id => apiRequest(`/entries/${id}`, { method: 'DELETE' })

export function updateEntry(id, entry) {
    return apiRequest(`/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    })
}
