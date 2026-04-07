import http from '../http'

export const getDashboardApi = () => http.get('/admin/dashboard')
