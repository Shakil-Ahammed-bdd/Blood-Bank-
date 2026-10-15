import { apiRequest } from './apiRequest'

export const donorApi = {
  list: (filters) => {
    const query = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) query.set(key, value)
    })
    return apiRequest(`/donors?${query}`)
  },
  get: (id) => apiRequest(`/donors/${encodeURIComponent(id)}`),
}
