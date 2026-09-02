import { apiRequest, setCsrfToken } from './apiClient'

export async function refreshCsrfToken() {
    const csrf = await apiRequest('/auth/csrf', { skipUnauthorizedEvent: true })
    setCsrfToken(csrf.token, csrf.headerName)
    return csrf
}

export function getCurrentUser() {
    return apiRequest('/auth/me', { skipUnauthorizedEvent: true })
}

export async function login(username, password) {
    await refreshCsrfToken()
    const user = await apiRequest('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        skipUnauthorizedEvent: true
    })
    await refreshCsrfToken()
    return user
}

export async function logout() {
    await apiRequest('/auth/logout', { method: 'POST' })
    await refreshCsrfToken()
}

export async function bootstrapAuthentication() {
    await refreshCsrfToken()
    try {
        return await getCurrentUser()
    } catch (error) {
        if (error.status === 401) return null
        throw error
    }
}
