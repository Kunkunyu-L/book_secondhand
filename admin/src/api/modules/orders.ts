import http from '../http'

export const getOrdersApi = (params: {
  page: number
  pageSize: number
  keyword?: string
  status?: string
}) => http.get('/admin/orders', { params })

export const updateOrderStatusApi = (data: {
  id: number
  status: string
}) => http.put('/admin/orders/status', data)

export const getOrderDetailApi = (params: { id: number }) =>
  http.get('/admin/orders/detail', { params })

export const getRefundListApi = (params: {
  page: number
  pageSize: number
  status?: string
}) => http.get('/admin/refunds', { params })

export const updateRefundStatusApi = (data: {
  id: number
  status: string
  remark?: string
}) => http.put('/admin/refunds/status', data)

export const getOrderStatsApi = (params: {
  start_date?: string
  end_date?: string
}) => http.get('/admin/orders/stats', { params })
