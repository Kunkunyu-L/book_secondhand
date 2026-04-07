import http from '../http'

export const getUsersApi = (params: {
  page: number
  pageSize: number
  keyword?: string
  status?: string
  role?: string
}) => http.get('/admin/users', { params })

export const updateUserStatusApi = (data: {
  id: number
  status: number
}) => http.put('/admin/users/status', data)

export const updateUserRoleApi = (data: {
  id: number
  role: string
}) => http.put('/admin/users/role', data)

export const updateUserApi = (data: {
  id: number
  nickname?: string
  phone?: string
  avatar?: string
  school?: string
  major?: string
  account?: number
}) => http.put('/admin/users', data)

export const addUserApi = (data: {
  username: string
  password: string
  phone?: string
  nickname?: string
  role: string
}) => http.post('/admin/users', data)

export const deleteUserApi = (data: { id: number }) =>
  http.delete('/admin/users', { data })

export const getViolationListApi = (params: {
  page: number
  pageSize: number
  user_id?: number
}) => http.get('/admin/violations', { params })

export const addViolationApi = (data: {
  user_id: number
  type: string
  reason: string
}) => http.post('/admin/violations', data)
