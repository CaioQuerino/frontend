import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})


// Interceptor para adicionar tratamento de erros consistente
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('O servidor demorou muito para responder'))
    }

    const errorMessage = error.response?.data?.error || 
                       error.response?.data?.message || 
                       'Erro na comunicação com o servidor'
    
    return Promise.reject(new Error(errorMessage))
  }
)