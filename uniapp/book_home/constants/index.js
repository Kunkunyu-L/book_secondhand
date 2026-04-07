/**
 * 成色等级配置
 */
export const CONDITION_LEVELS = [
  { label: '全新', value: 10 },
  { label: '九成新', value: 9 },
  { label: '八成新', value: 8 },
  { label: '七成新', value: 7 }
]

/**
 * 根据成色值获取文字描述
 * @param {number} condition - 成色值 (7-10)
 * @returns {string} 成色描述
 */
export function getConditionText(condition) {
  if (!condition) return ''
  if (condition >= 10) return '全新'
  if (condition >= 9) return '九成新'
  if (condition >= 8) return '八成新'
  if (condition >= 7) return '七成新'
  return '六成以下'
}

/**
 * 专业关键词映射（智能推荐辅助）
 */
export const MAJOR_KEYWORDS = {
  '计算机': ['计算机', '编程', 'Python', 'Java', '数据结构', '算法', '软件'],
  '软件工程': ['计算机', '编程', '软件', '架构', '数据库'],
  '数学': ['数学', '高等数学', '线性代数', '概率论', '数学分析'],
  '物理': ['物理', '力学', '电磁', '量子', '热力学'],
  '化学': ['化学', '有机化学', '无机化学', '分析化学'],
  '经济': ['经济', '微观经济', '宏观经济', '金融', '会计'],
  '金融': ['金融', '投资', '财务', '会计', '经济'],
  '中文': ['文学', '汉语', '写作', '古典', '诗词'],
  '历史': ['历史', '中国史', '世界史', '文明'],
  '英语': ['英语', '英文', '口语', 'IELTS', 'TOEFL'],
  '医学': ['医学', '解剖', '药理', '临床', '生理'],
  '法学': ['法律', '民法', '刑法', '宪法', '诉讼'],
  '教育': ['教育', '心理', '教学', '课程'],
  '艺术': ['艺术', '设计', '美术', '绘画']
}

/**
 * 计算推荐分数
 * @param {Object} book - 图书对象
 * @param {string} major - 专业名称
 * @returns {number} 推荐分数
 */
export function getRecommendScore(book, major) {
  if (!major) return 0
  const keywords = MAJOR_KEYWORDS[major] || [major]
  const target = `${book.title || ''} ${book.author || ''} ${book.tags || ''} ${book.category_name || ''}`.toLowerCase()
  let score = 0
  for (const kw of keywords) {
    if (target.includes(kw.toLowerCase())) score += 1
  }
  return score
}

/**
 * 图书状态配置
 */
export const BOOK_STATUS = {
  ONSALE: { value: 'onsale', label: '在售', type: 'success' },
  OFFLINE: { value: 'offline', label: '下架', type: 'info' },
  SOLD: { value: 'sold', label: '已售', type: 'warning' },
  REVIEWING: { value: 'reviewing', label: '审核中', type: 'default' },
  VIOLATION: { value: 'violation', label: '违规', type: 'danger' }
}

/**
 * 订单状态配置
 */
export const ORDER_STATUS = {
  PENDING: { value: 'pending', label: '待付款', color: '#FF9500' },
  PAID: { value: 'paid', label: '待发货', color: '#007AFF' },
  SHIPPED: { value: 'shipped', label: '待收货', color: '#52C41A' },
  RECEIVED: { value: 'received', label: '已完成', color: '#999' },
  CANCELLED: { value: 'cancelled', label: '已取消', color: '#999' }
}

/**
 * 用户角色配置
 */
export const USER_ROLES = {
  SUPER_ADMIN: { value: 'superAdmin', label: '超级管理员' },
  OPERATION_ADMIN: { value: 'operationAdmin', label: '运营管理员' },
  CUSTOMER_SERVICE: { value: 'customerService', label: '客服' },
  USER: { value: 'user', label: '用户' }
}
