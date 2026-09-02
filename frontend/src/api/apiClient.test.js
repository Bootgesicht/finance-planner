import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiRequest, setCsrfToken } from './apiClient'

describe('apiRequest', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
        setCsrfToken(null)
    })

    it('sends session credentials and the CSRF header for mutations', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 204
        })
        setCsrfToken('csrf-value', 'X-XSRF-TOKEN')

        await apiRequest('/entries', { method: 'POST' })

        const options = fetchMock.mock.calls[0][1]
        expect(options.credentials).toBe('include')
        expect(options.headers.get('X-XSRF-TOKEN')).toBe('csrf-value')
    })

    it('notifies the auth state when an authenticated request becomes unauthorized', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 401,
            json: vi.fn().mockResolvedValue({ message: 'Anmeldung erforderlich.' })
        })
        const listener = vi.fn()
        window.addEventListener('financeplanner:unauthorized', listener)

        await expect(apiRequest('/entries')).rejects.toMatchObject({ status: 401 })
        expect(listener).toHaveBeenCalledOnce()
        window.removeEventListener('financeplanner:unauthorized', listener)
    })
})
