import axios from 'axios'

const client = axios.create({ baseURL: '/api' })

client.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: data => client.post('/auth/login', data),
  register: data => client.post('/auth/register', data),
}

export const transactionApi = {
  getAll: () => client.get('/transactions'),
  getSummary: () => client.get('/transactions/summary'),
  create: data => client.post('/transactions', data),
  update: (id, data) => client.put(`/transactions/${id}`, data),
  delete: id => client.delete(`/transactions/${id}`),
}

export const categoryApi = {
  getAll: () => client.get('/categories'),
}
