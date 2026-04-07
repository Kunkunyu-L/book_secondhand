/**
 * API 统一导出
 *
 * @module api
 */

import http from './http'

// 导出所有 API 模块
export * from './modules'

// 导出 HTTP 实例（供其他模块使用）
export default http

/**
 * 按模块分类的 API 导出
 *
 * 使用方式：
 * ```typescript
 * import { loginApi } from '@/api'              // 从统一入口导入
 * import { loginApi } from '@/api/modules/auth' // 从具体模块导入
 * ```
 */
