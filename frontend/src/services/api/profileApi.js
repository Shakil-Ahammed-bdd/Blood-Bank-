import { apiRequest } from './apiRequest'

export const profileApi = {
  get: () => apiRequest('/users/profile'),
  update: (changes) =>
    apiRequest('/users/profile', { method: 'PATCH', body: JSON.stringify(changes) }),
}
