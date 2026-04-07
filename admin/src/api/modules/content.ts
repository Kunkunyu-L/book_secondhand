import http from '../http'

export const getDiscoverPostsApi = (params: {
  page: number
  pageSize: number
  keyword?: string
}) => http.get('/admin/discover/posts', { params })

export const deleteDiscoverPostApi = (data: { id: number }) =>
  http.delete('/admin/discover/posts', { data })

export const getDiscoverCommentsApi = (params: {
  post_id: number
  page: number
  pageSize: number
}) => http.get('/admin/discover/comments', { params })

export const deleteDiscoverCommentApi = (data: { id: number }) =>
  http.delete('/admin/discover/comments', { data })

export const getAnnouncementsApi = (params?: {
  type?: string
  status?: number
}) => http.get('/admin/announcements', { params })

export const addAnnouncementApi = (data: {
  title: string
  content: string
  type: string
  status: number
}) => http.post('/admin/announcements', data)

export const updateAnnouncementApi = (data: {
  id: number
  title?: string
  content?: string
  type?: string
  status?: number
}) => http.put('/admin/announcements', data)

export const deleteAnnouncementApi = (data: { id: number }) =>
  http.delete('/admin/announcements', { data })

export const getBannersApi = () => http.get('/admin/banners')

export const addBannerApi = (data: {
  title: string
  image: string
  link?: string
  sort_order?: number
}) => http.post('/admin/banners', data)

export const updateBannerApi = (data: {
  id: number
  title?: string
  image?: string
  link?: string
  sort_order?: number
}) => http.put('/admin/banners', data)

export const deleteBannerApi = (data: { id: number }) =>
  http.delete('/admin/banners', { data })
