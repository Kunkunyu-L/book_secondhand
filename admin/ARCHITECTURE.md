# Admin 项目架构说明

## 目录结构

```
admin/src/
├── views/                          # 页面视图
│   ├── index.ts                    # 统一导出入口
│   ├── auth/                       # 认证模块
│   ├── layout/                     # 布局模块
│   ├── dashboard/                  # 仪表盘模块
│   ├── books/                      # 书籍管理模块
│   ├── orders/                     # 订单管理模块
│   ├── users/                      # 用户管理模块
│   ├── transactions/               # 交易管理模块
│   ├── content/                    # 内容管理模块
│   ├── service/                    # 客服管理模块
│   └── system/                     # 系统设置模块
│
├── api/                            # API 接口
│   ├── index.ts                    # 统一导出入口
│   ├── http.ts                     # HTTP 客户端配置
│   └── modules/                    # API 模块
│       ├── index.ts                # 模块统一导出
│       ├── auth.ts                 # 认证 API
│       ├── dashboard.ts            # 仪表盘 API
│       ├── users.ts                # 用户管理 API
│       ├── books.ts                # 书籍管理 API
│       ├── orders.ts               # 订单管理 API
│       ├── transactions.ts         # 交易管理 API
│       ├── content.ts              # 内容管理 API
│       ├── service.ts              # 客服管理 API
│       └── system.ts               # 系统设置 API
│
├── stores/                         # Pinia 状态管理
│   ├── index.ts                    # 统一导出入口
│   └── modules/                    # Store 模块
│       ├── index.ts                # 模块统一导出
│       ├── auth.ts                 # 认证状态
│       └── permission.ts           # 权限状态
│
├── utils/                          # 工具函数
│   ├── index.ts                    # 统一导出入口
│   ├── format/                     # 格式化工具
│   │   ├── index.ts
│   │   └── formatTime.ts
│   ├── helpers/                    # 辅助工具
│   │   ├── index.ts
│   │   ├── image.ts
│   │   ├── notificationSound.ts
│   │   └── export.ts
│   └── network/                    # 网络工具
│       ├── index.ts
│       ├── upload.ts
│       └── socket.ts
│
├── components/                     # 共享组件
│   ├── index.ts                    # 统一导出入口
│   ├── chat/                       # 聊天组件
│   ├── common/                     # 通用组件
│   └── layout/                     # 布局组件
│
├── router/
│   └── index.ts                    # 路由配置
│
├── assets/                         # 静态资源
│
├── styles/                         # 全局样式
│   └── design-system.css           # 设计系统样式
│
├── App.vue                         # 根组件
├── main.ts                         # 应用入口
└── theme.css                       # 主题配置
```

## 模块划分

### Views (页面视图)

| 模块 | 路径 | 功能 |
|------|------|------|
| **认证** | `views/auth/` | 登录页面 |
| **布局** | `views/layout/` | 主布局框架 |
| **仪表盘** | `views/dashboard/` | 数据概览 |
| **书籍管理** | `views/books/` | 分类、平台图书、用户图书、审核 |
| **订单管理** | `views/orders/` | 订单列表、退款、统计 |
| **用户管理** | `views/users/` | 用户列表、违规处理 |
| **交易管理** | `views/transactions/` | 支付、提现、优惠券 |
| **内容管理** | `views/content/` | 公告、轮播图、帖子 |
| **客服管理** | `views/service/` | 聊天、工单、FAQ |
| **系统设置** | `views/system/` | 系统配置、权限管理 |

### API (接口层)

| 模块 | 文件 | 功能 |
|------|------|------|
| **auth** | `modules/auth.ts` | 登录、验证码 |
| **dashboard** | `modules/dashboard.ts` | 仪表盘数据 |
| **users** | `modules/users.ts` | 用户管理、违规记录 |
| **books** | `modules/books.ts` | 分类、图书、审核 |
| **orders** | `modules/orders.ts` | 订单、退款、统计 |
| **transactions** | `modules/transactions.ts` | 支付、提现、优惠券 |
| **content** | `modules/content.ts` | 公告、轮播图、帖子 |
| **service** | `modules/service.ts` | 聊天、工单、FAQ |
| **system** | `modules/system.ts` | 系统配置、权限、通知 |

### Stores (状态管理)

| 模块 | 文件 | 功能 |
|------|------|------|
| **auth** | `modules/auth.ts` | 用户认证状态 |
| **permission** | `modules/permission.ts` | 权限控制状态 |

### Utils (工具函数)

| 分类 | 目录 | 功能 |
|------|------|------|
| **format** | `format/` | 时间格式化等 |
| **helpers** | `helpers/` | 图片、通知、导出 |
| **network** | `network/` | 上传、WebSocket |

### Components (共享组件)

| 分类 | 目录 | 功能 |
|------|------|------|
| **chat** | `chat/` | 聊天相关组件 |
| **common** | `common/` | 通用业务组件 |
| **layout** | `layout/` | 布局相关组件 |

## 使用方式

### 导入组件

```typescript
// 从模块目录导入
import { Dashboard } from '@/views/dashboard'
import { getUsersApi } from '@/api/modules/users'

// 从统一入口导入（推荐）
import { Dashboard } from '@/views'
import { getUsersApi, updateUserStatusApi } from '@/api'
```

### 导入工具函数

```typescript
// 从统一入口导入（推荐）
import { formatTime, getImageUrl, uploadImage } from '@/utils'

// 从具体模块导入
import { formatTime } from '@/utils/format'
import { uploadImage } from '@/utils/network'
```

### 导入状态管理

```typescript
import { useAuthStore, usePermissionStore } from '@/stores'

const authStore = useAuthStore()
```

## 路由配置

路由使用新的模块化路径，每个路由包含 `module` 元信息：

```typescript
{
  path: 'orders',
  name: 'Orders',
  component: () => import('../views/orders/OrderManage.vue'),
  meta: {
    title: '订单列表',    // 页面标题
    module: 'orders'      // 所属模块
  }
}
```

## 开发规范

### 1. 添加新页面

1. 在对应 `views/模块目录/` 下创建页面组件
2. 更新模块的 `index.ts` 导出文件
3. 在 `router/index.ts` 添加路由配置

### 2. 添加新 API

1. 在对应 `api/modules/模块.ts` 中添加接口函数
2. 添加 JSDoc 注释说明参数和返回值
3. 确保使用 TypeScript 类型

### 3. 添加新组件

1. 按用途放入对应的 `components/分类/` 目录
2. 更新分类的 `index.ts` 导出文件
3. 更新 `components/index.ts` 主导出

### 4. 添加新工具函数

1. 按功能放入对应的 `utils/分类/` 目录
2. 更新分类的 `index.ts` 导出文件
3. 更新 `utils/index.ts` 主导出

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase.vue | `UserManage.vue` |
| API 文件 | camelCase.ts | `userInfo.ts` |
| 工具文件 | camelCase.ts | `formatTime.ts` |
| 接口函数 | camelCaseApi | `getUsersApi` |
| Store | use + Pascal + Store | `useAuthStore` |

## 权限控制

- 超级管理员 (`superAdmin`) 拥有全部权限
- 其他角色通过 `rolePagePermission` 配置控制访问
- 权限验证在路由守卫中处理
