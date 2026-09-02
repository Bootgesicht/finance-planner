import { apiRequest } from './apiClient'

export function getUsers() {
    return apiRequest('/users')
}
