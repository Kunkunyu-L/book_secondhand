import axios from 'axios'
import { ElMessage } from 'element-plus'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = token
  return config
})

http.interceptors.response.use(
  (response) => {
    const data = response.data
    // 后端有些场景使用 res.cc 返回业务 status，但 HTTP 仍为 200
    if (data && data.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_username')
      window.location.href = '/login'
      return Promise.reject(data)
    }
    return data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_username')
      window.location.href = '/login'
    }
    ElMessage.error(error.response?.data?.message || '请求失败')
    return Promise.reject(error)
  }
)

// ==================== 认证 ====================
export const getCaptchaApi = () => http.get('/api/captcha')
export const loginApi = (data: any) => http.post('/api/login', data)

// ==================== 图片上传 ====================
// 使用 admin/src/utils/upload.ts 的 uploadImage，因需 FormData

// ==================== 仪表盘 ====================
export const getDashboardApi = () => http.get('/admin/dashboard')

// ==================== 用户管理 ====================
export const getUsersApi = (params: any) => http.get('/admin/users', { params })
export const updateUserStatusApi = (data: any) => http.put('/admin/users/status', data)
export const updateUserRoleApi = (data: any) => http.put('/admin/users/role', data)
export const updateUserApi = (data: any) => http.put('/admin/users', data)
export const addUserApi = (data: any) => http.post('/admin/users', data)
export const deleteUserApi = (data: any) => http.delete('/admin/users', { data })

// ==================== 用户违规 ====================
export const getViolationListApi = (params: any) => http.get('/admin/violations', { params })
export const addViolationApi = (data: any) => http.post('/admin/violations', data)

// ==================== 分类管理 ====================
export const getCategoriesApi = () => http.get('/admin/categories')
export const addCategoryApi = (data: any) => http.post('/admin/categories', data)
export const updateCategoryApi = (data: any) => http.put('/admin/categories', data)
export const deleteCategoryApi = (data: any) => http.delete('/admin/categories', { data })

// ==================== 平台图书 ====================
export const getPlatformBooksApi = (params: any) => http.get('/admin/books/platform', { params })
export const addPlatformBookApi = (data: any) => http.post('/admin/books/platform', data)
export const updatePlatformBookApi = (data: any) => http.put('/admin/books/platform', data)
export const deletePlatformBookApi = (data: any) => http.delete('/admin/books/platform', { data })

// ==================== 用户图书 ====================
export const getUserBooksApi = (params: any) => http.get('/admin/books/user', { params })
export const updateUserBookStatusApi = (data: any) => http.put('/admin/books/user/status', data)

// ==================== 书籍审核 ====================
export const getBookAuditListApi = (params: any) => http.get('/admin/books/audit', { params })
export const auditBookApi = (data: any) => http.put('/admin/books/audit', data)

// ==================== 订单管理 ====================
export const getOrdersApi = (params: any) => http.get('/admin/orders', { params })
export const updateOrderStatusApi = (data: any) => http.put('/admin/orders/status', data)
export const getOrderDetailApi = (params: any) => http.get('/admin/orders/detail', { params })

// ==================== 退款管理 ====================
export const getRefundListApi = (params: any) => http.get('/admin/refunds', { params })
export const updateRefundStatusApi = (data: any) => http.put('/admin/refunds/status', data)

// ==================== 订单统计 ====================
export const getOrderStatsApi = (params: any) => http.get('/admin/orders/stats', { params })

// ==================== 支付记录 ====================
export const getPaymentListApi = (params: any) => http.get('/admin/payments', { params })

// ==================== 提现管理 ====================
export const getWithdrawalListApi = (params: any) => http.get('/admin/withdrawals', { params })
export const updateWithdrawalStatusApi = (data: any) => http.put('/admin/withdrawals/status', data)

// ==================== 优惠券管理 ====================
export const getCouponListApi = () => http.get('/admin/coupons')
export const addCouponApi = (data: any) => http.post('/admin/coupons', data)
export const updateCouponApi = (data: any) => http.put('/admin/coupons', data)
export const deleteCouponApi = (data: any) => http.delete('/admin/coupons', { data })

// ==================== 帖子管理 ====================
export const getDiscoverPostsApi = (params: any) => http.get('/admin/discover/posts', { params })
export const deleteDiscoverPostApi = (data: any) => http.delete('/admin/discover/posts', { data })
export const getDiscoverCommentsApi = (params: any) => http.get('/admin/discover/comments', { params })
export const deleteDiscoverCommentApi = (data: any) => http.delete('/admin/discover/comments', { data })

// ==================== 公告管理 ====================
export const getAnnouncementsApi = (params?: any) => http.get('/admin/announcements', { params })
export const addAnnouncementApi = (data: any) => http.post('/admin/announcements', data)
export const updateAnnouncementApi = (data: any) => http.put('/admin/announcements', data)
export const deleteAnnouncementApi = (data: any) => http.delete('/admin/announcements', { data })

// ==================== 轮播图 ====================
export const getBannersApi = () => http.get('/admin/banners')
export const addBannerApi = (data: any) => http.post('/admin/banners', data)
export const updateBannerApi = (data: any) => http.put('/admin/banners', data)
export const deleteBannerApi = (data: any) => http.delete('/admin/banners', { data })

// ==================== 客服会话 ====================
export const getChatSessionsApi = (params: any) => http.get('/admin/chat/sessions', { params })
export const assignSessionApi = (data: any) => http.put('/admin/chat/sessions/assign', data)
export const closeSessionApi = (data: any) => http.put('/admin/chat/sessions/close', data)
export const getChatMessagesApi = (params: any) => http.get('/chat/messages', { params })

// ==================== 客服人员管理 ====================
export const getServiceStaffApi = () => http.get('/admin/service-staff')
export const updateServiceStaffApi = (data: any) => http.put('/admin/service-staff', data)

// ==================== 工单管理 ====================
export const getTicketsApi = (params: any) => http.get('/admin/tickets', { params })
export const updateTicketApi = (data: any) => http.put('/admin/tickets', data)

// ==================== FAQ ====================
export const getFaqsApi = (params?: any) => http.get('/admin/faq', { params })
export const saveFaqApi = (data: any) => http.post('/admin/faq', data)
export const deleteFaqApi = (data: any) => http.delete('/admin/faq', { data })


// ==================== 系统配置 ====================
export const getConfigsApi = () => http.get('/admin/configs')
export const saveConfigsApi = (data: any) => http.put('/admin/configs', data)

// ==================== 角色页面权限 ====================
export const getRolePagePermissionApi = () => http.get('/admin/role-page-permission')
export const saveRolePagePermissionApi = (data: any) => http.put('/admin/role-page-permission', data)

// ==================== 通知模板 ====================
export const getNotificationTemplatesApi = () => http.get('/admin/notification-templates')
export const saveNotificationTemplateApi = (data: any) => http.post('/admin/notification-templates', data)
export const deleteNotificationTemplateApi = (data: any) => http.delete('/admin/notification-templates', { data })

// ==================== 站内通知 ====================
export const getNotificationsApi = (params?: any) => http.get('/admin/notifications', { params })
export const sendNotificationApi = (data: any) => http.post('/admin/notifications', data)
export const markNotificationReadApi = (data: any) => http.put('/admin/notifications/read', data)
export const deleteNotificationApi = (data: any) => http.delete('/admin/notifications', { data })

export default http
