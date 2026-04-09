# API接口设计规范文档

## 一、接口设计原则

### 1.1 RESTful 风格

本系统采用 RESTful API 设计风格，遵循以下原则：

| 原则 | 说明 | 示例 |
|------|------|------|
| 资源导向 | URL表示资源 | `/home/books/market` |
| HTTP方法 | 语义化操作 | GET/POST/PUT/DELETE |
| 状态码 | 标准HTTP状态码 | 200/400/401/500 |
| 无状态 | 每个请求独立 | JWT认证 |

### 1.2 统一响应格式

所有接口遵循统一的响应格式：

```javascript
// 成功响应
{
  "status": 0,           // 0表示成功
  "message": "success",  // 消息描述
  "data": {              // 业务数据
    ...
  }
}

// 错误响应
{
  "status": 1,           // 非0表示失败
  "message": "错误信息",
  "data": null
}
```

---

## 二、接口分类与规范

### 2.1 公开接口（无需认证）

| 路径 | 方法 | 说明 |
|------|------|------|
| /api/register | POST | 用户注册 |
| /api/login | POST | 用户登录 |
| /api/captcha | GET | 获取验证码 |
| /home/config | GET | 系统配置 |
| /home/categories/level1 | GET | 一级分类 |
| /home/books/market | GET | 书市列表 |
| /home/books/search | GET | 搜索图书 |
| /home/banners | GET | 轮播图 |
| /home/announcements | GET | 公告列表 |
| /discover/posts | GET | 帖子列表 |

### 2.2 用户接口（需要认证）

| 路径 | 方法 | 说明 |
|------|------|------|
| /my/getUserInfo | GET | 获取用户信息 |
| /my/updateProfile | PUT | 更新资料 |
| /address/list | GET | 地址列表 |
| /address/add | POST | 新增地址 |
| /order/create | POST | 创建订单 |
| /order/list | GET | 订单列表 |
| /favorite/add | POST | 添加收藏 |
| /publish/book | POST | 发布图书 |
| /discover/posts | POST | 发布帖子 |

### 2.3 后台管理接口（需要管理员权限）

| 路径 | 方法 | 说明 |
|------|------|------|
| /admin/dashboard | GET | 数据看板 |
| /admin/users | GET/POST/PUT | 用户管理 |
| /admin/books/platform | GET/POST/PUT | 平台图书 |
| /admin/orders | GET/PUT | 订单管理 |
| /admin/chat/sessions | GET | 会话管理 |
| /admin/configs | GET/PUT | 系统配置 |

---

## 三、核心接口详解

### 3.1 智能推荐接口

#### 接口信息

| 项目 | 值 |
|------|-----|
| 路径 | /home/books/recommend |
| 方法 | GET |
| 认证 | 需要 |
| 参数 | limit（可选，默认20） |

#### 请求示例

```http
GET /home/books/recommend?limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 响应示例

```javascript
{
  "status": 0,
  "message": "success",
  "data": {
    "books": [
      {
        "id": 123,
        "title": "数据结构（C语言版）",
        "author": "严蔚敏",
        "cover_img": "http://...",
        "price": 25.50,
        "book_type": "user",
        "recommend_score": 85.5  // 推荐分数
      }
    ],
    "total": 20
  }
}
```

#### 算法流程

```
1. 验证JWT Token，获取用户ID
2. 查询用户专业信息
3. 获取所有在售图书
4. 计算推荐分数（多因子加权）
5. 按分数排序
6. 返回Top-N结果
```

---

### 3.2 图书详情接口

#### 接口信息

| 项目 | 值 |
|------|-----|
| 路径 | /home/books/detail |
| 方法 | POST |
| 认证 | 否 |
| 参数 | bookId, bookType |

#### 请求示例

```javascript
POST /home/books/detail
{
  "bookId": 123,
  "bookType": "user"  // 或 "platform"
}
```

#### 响应示例

```javascript
{
  "status": 0,
  "message": "success",
  "data": {
    "book": {
      "id": 123,
      "isbn": "978730202368",
      "title": "数据结构",
      "author": "严蔚敏",
      "publisher": "清华大学出版社",
      "category": 1,
      "tags": "计算机,考研",
      "cover_img": "http://...",
      "detail_imgs": ["...", "..."],
      "description": "...",
      "book_story": "考研核心资料...",
      "conditions": [
        {
          "condition": 9,
          "condition_desc": "九成新",
          "price": 25.50,
          "stock": 1
        }
      ]
    },
    "seller": {
      "id": 1002,
      "nickname": "张三",
      "credit_score": 100
    },
    "is_favorite": false
  }
}
```

---

### 3.3 创建订单接口

#### 接口信息

| 项目 | 值 |
|------|-----|
| 路径 | /order/create |
| 方法 | POST |
| 认证 | 需要 |
| 参数 | items[], addressId, couponId |

#### 请求示例

```javascript
POST /order/create
Authorization: Bearer xxx
{
  "items": [
    {
      "bookId": 123,
      "bookType": "user",
      "condition": 9,
      "quantity": 1
    }
  ],
  "addressId": 5,
  "couponId": 10  // 可选
}
```

#### 响应示例

```javascript
{
  "status": 0,
  "message": "订单创建成功",
  "data": {
    "order_id": 1,
    "order_no": "202603201708056392",
    "total_amount": 25.50,
    "need_pay": 22.50  // 优惠券后
  }
}
```

#### 业务逻辑

```
1. 验证用户登录状态
2. 验证图书库存和状态
3. 计算订单金额
4. 应用优惠券（如有）
5. 扣减库存
6. 保存订单快照
7. 生成订单号
8. 返回支付信息
```

---

### 3.4 Socket.IO 聊天接口

#### 连接

```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
```

#### 事件列表

| 事件名 | 方向 | 说明 |
|--------|------|------|
| connection | ↑ | 建立连接 |
| create_session | ↑ | 创建会话 |
| send_message | ↑ | 发送消息 |
| mark_read | ↑ | 标记已读 |
| new_message | ↓ | 接收新消息 |
| message_read | ↓ | 消息已读通知 |
| session_updated | ↓ | 会话更新 |

#### 消息格式

```javascript
// 发送消息
socket.emit('send_message', {
  session_id: 8,
  content: '这本书还在吗？',
  msg_type: 'text'
})

// 接收消息
socket.on('new_message', (data) => {
  {
    "id": 118,
    "session_id": 8,
    "sender_id": 1002,
    "sender_role": "user",
    "content": "这本书还在吗？",
    "msg_type": "text",
    "created_at": "2026-03-20 23:41:01"
  }
})
```

---

## 四、数据验证规范

### 4.1 Joi 验证示例

```javascript
// 图书详情验证
const bookDetailSchema = Joi.object({
  bookId: Joi.number().integer().required()
    .messages({ 'number.base': '图书ID必须是数字' }),
  bookType: Joi.string().valid('user', 'platform').required()
    .messages({ 'any.only': '图书类型只能是user或platform' })
})

// 创建订单验证
const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      bookId: Joi.number().integer().required(),
      bookType: Joi.string().valid('user', 'platform').required(),
      condition: Joi.number().integer().min(7).max(10).required(),
      quantity: Joi.number().integer().min(1).max(99).default(1)
    })
  ).min(1).required(),
  addressId: Joi.number().integer().required(),
  couponId: Joi.number().integer().optional(),
  remark: Joi.string().max(255).optional()
})
```

### 4.2 错误响应

```javascript
// 验证失败
{
  "status": 1,
  "message": "bookId 必须是数字",
  "data": null
}

// 业务错误
{
  "status": 1,
  "message": "图书库存不足",
  "data": {
    "book_id": 123,
    "current_stock": 0
  }
}
```

---

## 五、认证授权规范

### 5.1 JWT Token 结构

```javascript
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "user_id": 1002,
  "role": "user",
  "iat": 1712345678,
  "exp": 1712432078
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### 5.2 请求头格式

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5.3 权限验证流程

```
请求 → 提取Token → 验证签名 → 检查过期 → 获取用户信息 → 验证权限 → 业务处理
         ↓            ↓          ↓            ↓              ↓          ↓
      无Token      签名无效     已过期       用户不存在       权限不足
         ↓            ↓          ↓            ↓              ↓
      返回401      返回401     返回401      返回401        返回403
```

---

## 六、分页规范

### 6.1 请求参数

```javascript
{
  "page": 1,        // 页码，从1开始
  "pageSize": 20,   // 每页数量
  "status": "onsale" // 筛选条件（可选）
}
```

### 6.2 响应格式

```javascript
{
  "status": 0,
  "message": "success",
  "data": {
    "list": [...],      // 数据列表
    "total": 100,       // 总记录数
    "page": 1,          // 当前页
    "pageSize": 20,     // 每页数量
    "totalPages": 5     // 总页数
  }
}
```

---

## 七、文件上传规范

### 7.1 上传接口

| 项目 | 值 |
|------|-----|
| 路径 | /upload/{type} |
| 方法 | POST |
| 类型 | multipart/form-data |
| type | avatar/book/discover/chat |

### 7.2 请求示例

```javascript
const formData = new FormData()
formData.append('file', file)
formData.append('type', 'book')

axios.post('/upload/book', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
```

### 7.3 响应示例

```javascript
{
  "status": 0,
  "message": "上传成功",
  "data": {
    "url": "http://59.110.64.215:3002/uploads/book/1774092960485_mnk3fsac.jpg",
    "filename": "1774092960485_mnk3fsac.jpg",
    "size": 123456
  }
}
```

---

## 八、状态码规范

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 200 | 成功 | 请求成功 |
| 400 | 请求错误 | 参数验证失败 |
| 401 | 未认证 | Token无效或过期 |
| 403 | 无权限 | 权限不足 |
| 404 | 未找到 | 资源不存在 |
| 500 | 服务器错误 | 服务器内部错误 |

---

## 九、接口文档管理

### 9.1 在线文档

系统提供了完整的 API 文档：

```
server/api-docs.md
```

### 9.2 接口变更管理

- 新增接口：标注 `NEW`
- 废弃接口：标注 `DEPRECATED`
- 修改接口：标注 `CHANGED`
- 保留30天兼容期

---

## 十、最佳实践

### 10.1 接口设计

- ✅ 使用名词复数：`/books` 而非 `/book`
- ✅ 版本控制：`/api/v1/books`
- ✅ 参数命名：驼峰命名法
- ✅ 时间格式：ISO 8601标准

### 10.2 性能优化

- ✅ 分页查询，避免全量返回
- ✅ 字段过滤，按需返回
- ✅ 缓存热点数据
- ✅ 异步处理耗时操作

### 10.3 安全建议

- ✅ 永远验证输入数据
- ✅ 使用参数化查询
- ✅ 敏感信息加密
- ✅ 限制请求频率

---

*文档版本: 1.0*
*最后更新: 2026年4月*
*作者: LiuHaonan*
*联系方式: 564644056@qq.com*
