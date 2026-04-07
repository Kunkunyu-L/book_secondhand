import http from '../http'

export const getPaymentListApi = (params: {
  page: number
  pageSize: number
  keyword?: string
}) => http.get('/admin/payments', { params })

export const getWithdrawalListApi = (params: {
  page: number
  pageSize: number
  status?: string
}) => http.get('/admin/withdrawals', { params })

export const updateWithdrawalStatusApi = (data: {
  id: number
  status: string
  remark?: string
}) => http.put('/admin/withdrawals/status', data)

export const getCouponListApi = () => http.get('/admin/coupons')

export const addCouponApi = (data: {
  code: string
  type: string
  value: number
  min_amount?: number
  max_uses?: number
  expires_at: string
}) => http.post('/admin/coupons', data)

export const updateCouponApi = (data: {
  id: number
  code?: string
  type?: string
  value?: number
  min_amount?: number
  max_uses?: number
  expires_at?: string
}) => http.put('/admin/coupons', data)

export const deleteCouponApi = (data: { id: number }) =>
  http.delete('/admin/coupons', { data })
