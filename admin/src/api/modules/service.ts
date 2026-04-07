import http from '../http'

export const getChatSessionsApi = (params: {
  page: number
  pageSize: number
  status?: string
  staff_id?: number
}) => http.get('/admin/chat/sessions', { params })

export const assignSessionApi = (data: {
  session_id: number
  staff_id: number
}) => http.put('/admin/chat/sessions/assign', data)

export const closeSessionApi = (data: { session_id: number }) =>
  http.put('/admin/chat/sessions/close', data)

export const getChatMessagesApi = (params: {
  session_id: number
  page?: number
  pageSize?: number
}) => http.get('/chat/messages', { params })

export const getServiceStaffApi = () => http.get('/admin/service-staff')

export const updateServiceStaffApi = (data: {
  id: number
  status?: string
  max_sessions?: number
}) => http.put('/admin/service-staff', data)

export const getTicketsApi = (params: {
  page: number
  pageSize: number
  status?: string
}) => http.get('/admin/tickets', { params })

export const updateTicketApi = (data: {
  id: number
  status?: string
  reply?: string
}) => http.put('/admin/tickets', data)

export const getFaqsApi = (params?: {
  category?: string
  keyword?: string
}) => http.get('/admin/faq', { params })

export const saveFaqApi = (data: {
  id?: number
  question: string
  answer: string
  category?: string
  sort_order?: number
}) => http.post('/admin/faq', data)

export const deleteFaqApi = (data: { id: number }) =>
  http.delete('/admin/faq', { data })
