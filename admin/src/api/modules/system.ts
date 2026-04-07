import http from '../http'

export const getConfigsApi = () => http.get('/admin/configs')

export const saveConfigsApi = (data: {
  site_name?: string
  site_description?: string
  contact_email?: string
  contact_phone?: string
  wechat_qr?: string
  [key: string]: any
}) => http.put('/admin/configs', data)

export const getRolePagePermissionApi = () =>
  http.get('/admin/role-page-permission')

export const saveRolePagePermissionApi = (data: {
  [role: string]: {
    pages: string[]
  }
}) => http.put('/admin/role-page-permission', data)

export const getNotificationTemplatesApi = () =>
  http.get('/admin/notification-templates')

export const saveNotificationTemplateApi = (data: {
  type: string
  title: string
  content: string
}) => http.post('/admin/notification-templates', data)

export const deleteNotificationTemplateApi = (data: { id: number }) =>
  http.delete('/admin/notification-templates', { data })

export const getNotificationsApi = (params?: {
  type?: string
  is_read?: number
}) => http.get('/admin/notifications', { params })

export const sendNotificationApi = (data: {
  title: string
  content: string
  type?: string
  target_type?: string
  target_id?: number
}) => http.post('/admin/notifications', data)

export const markNotificationReadApi = (data: { id: string | number }) =>
  http.put('/admin/notifications/read', data)

export const deleteNotificationApi = (data: { id: number }) =>
  http.delete('/admin/notifications', { data })
