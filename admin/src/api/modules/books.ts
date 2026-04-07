import http from '../http'

export const getCategoriesApi = () => http.get('/admin/categories')

export const addCategoryApi = (data: {
  name: string
  parent_id?: number
  sort_order?: number
}) => http.post('/admin/categories', data)

export const updateCategoryApi = (data: {
  id: number
  name?: string
  parent_id?: number
  sort_order?: number
}) => http.put('/admin/categories', data)

export const deleteCategoryApi = (data: { id: number }) =>
  http.delete('/admin/categories', { data })

export const getPlatformBooksApi = (params: {
  page: number
  pageSize: number
  keyword?: string
  category_id?: number
}) => http.get('/admin/books/platform', { params })

export const addPlatformBookApi = (data: {
  title: string
  author: string
  publisher: string
  isbn?: string
  price: number
  stock: number
  category_id: number
  cover?: string
  description?: string
}) => http.post('/admin/books/platform', data)

export const updatePlatformBookApi = (data: {
  id: number
  title?: string
  author?: string
  publisher?: string
  isbn?: string
  price?: number
  stock?: number
  category_id?: number
  cover?: string
  description?: string
}) => http.put('/admin/books/platform', data)

export const deletePlatformBookApi = (data: { id: number }) =>
  http.delete('/admin/books/platform', { data })

export const getUserBooksApi = (params: {
  page: number
  pageSize: number
  keyword?: string
  category_id?: number
  status?: string
}) => http.get('/admin/books/user', { params })

export const updateUserBookStatusApi = (data: {
  id: number
  status: string
}) => http.put('/admin/books/user/status', data)

export const getBookAuditListApi = (params: {
  page: number
  pageSize: number
  keyword?: string
}) => http.get('/admin/books/audit', { params })

export const auditBookApi = (data: {
  id: number
  status: string
  reason?: string
}) => http.put('/admin/books/audit', data)
