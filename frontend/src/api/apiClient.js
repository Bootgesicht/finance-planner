const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

let csrfToken = null
let csrfHeaderName = 'X-XSRF-TOKEN'

export function setCsrfToken(token, headerName = 'X-XSRF-TOKEN') {
    csrfToken = token
    csrfHeaderName = headerName
}

export async function apiRequest(path, options = {}) {
    const { skipUnauthorizedEvent = false, ...fetchOptions } = options
    const method = (fetchOptions.method || 'GET').toUpperCase()
    const headers = new Headers(fetchOptions.headers || {})

    if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && csrfToken) {
        headers.set(csrfHeaderName, csrfToken)
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...fetchOptions,
        headers,
        credentials: 'include'
    })

    if (!response.ok) {
        let message = 'Die Anfrage ist fehlgeschlagen.'
        try {
            const error = await response.json()
            message = error.detail || error.message || message
        } catch {
            // Keep the fallback for responses without a JSON body.
        }

        if (response.status === 401 && !skipUnauthorizedEvent) {
            window.dispatchEvent(new Event('financeplanner:unauthorized'))
        }

        const requestError = new Error(message)
        requestError.status = response.status
        throw requestError
    }

    if (response.status === 204) return undefined
    const responseText = await response.text()
    return responseText ? JSON.parse(responseText) : undefined
}
