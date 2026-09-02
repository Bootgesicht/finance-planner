import { apiRequest } from './apiClient'

export function getPersons() {
    return apiRequest('/persons')
}

export function createPerson(person) {
    return apiRequest('/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(person)
    })
}
