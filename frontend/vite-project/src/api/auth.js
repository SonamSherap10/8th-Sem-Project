import client from './client'

export const authApi = {
  login: (email, password) =>
    client.post('/api/auth/login', { email, password_hash: password }),
  register: (name, email, password) =>
    client.post('/api/auth/register', { name, email, password_hash: password }),
}
