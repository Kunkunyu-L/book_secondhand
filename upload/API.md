# 上传服务 API 文档

## 服务信息

- **服务地址**: `http://59.110.64.215:3002`
- **端口**: 3002
- **框架**: Express + Multer

## 鉴权（必填）

为防止接口被滥用，**每次调用上传接口必须携带秘钥** `authKey=123456Ln@`。

支持三种方式（推荐第 1 种）：

- **Header**: `x-auth-key: 123456Ln@`
- **Query**: `?authKey=123456Ln@`
- **Body**: 表单字段 `authKey=123456Ln@`

## 文件分类 (type)

| type     | 说明         |
| -------- | ------------ |
| avatar   | 用户头像     |
| banner   | 轮播图       |
| book     | 图书图片     |
| logo     | Logo         |
| discover | 发现帖图片   |
| category | 分类图片     |
| platform | 平台图书封面 |
| other    | 其他（默认） |

---

## 接口列表

### 1. 图片上传

仅支持图片格式：`jpg`、`jpeg`、`png`、`gif`、`webp`，单张最大 5MB。

**请求**

```
POST http://59.110.64.215:3002/upload/image
Content-Type: multipart/form-data
```

**参数**

| 参数 | 位置          | 类型   | 必填 | 说明                          |
| ---- | ------------- | ------ | ---- | ----------------------------- |
| file | body          | File   | 是   | 图片文件，字段名必须为 `file` |
| type | query 或 body | string | 否   | 分类，默认 `other`            |

**示例 (curl)**

```bash
# 上传头像
curl -X POST "http://59.110.64.215:3002/upload/image?type=avatar" \
  -H "x-auth-key: 123456Ln@" \
  -F "file=@/path/to/avatar.jpg"

# 上传轮播图
curl -X POST "http://59.110.64.215:3002/upload/image?type=banner" \
  -H "x-auth-key: 123456Ln@" \
  -F "file=@banner.png"

# 上传图书图片
curl -X POST "http://59.110.64.215:3002/upload/image?type=book" \
  -H "x-auth-key: 123456Ln@" \
  -F "file=@book_cover.jpg"

# 上传 Logo
curl -X POST "http://59.110.64.215:3002/upload/image?type=logo" \
  -H "x-auth-key: 123456Ln@" \
  -F "file=@logo.png"
```

**成功响应 (200)**

```json
{
  "status": 200,
  "message": "上传成功",
  "data": {
    "url": "http://59.110.64.215:3002/uploads/avatar/1710765432_abc123.jpg",
    "path": "/uploads/avatar/1710765432_abc123.jpg",
    "filename": "1710765432_abc123.jpg"
  }
}
```

**失败响应 (400)**

```json
{
  "status": 400,
  "message": "请选择图片",
  "data": null
}
```

---

### 2. 文件上传

支持图片及常见文档（pdf、doc、docx、xls、xlsx），单个文件最大 10MB。

**请求**

```
POST http://59.110.64.215:3002/upload/file
Content-Type: multipart/form-data
```

**参数**

| 参数 | 位置          | 类型   | 必填 | 说明                      |
| ---- | ------------- | ------ | ---- | ------------------------- |
| file | body          | File   | 是   | 文件，字段名必须为 `file` |
| type | query 或 body | string | 否   | 分类，默认 `other`        |

**示例 (curl)**

```bash
curl -X POST "http://59.110.64.215:3002/upload/file?type=other" \
  -H "x-auth-key: 123456Ln@" \
  -F "file=@document.pdf"
```

**成功响应 (200)**

```json
{
  "status": 200,
  "message": "上传成功",
  "data": {
    "url": "http://59.110.64.215:3002/uploads/other/1710765432_xyz789.pdf",
    "path": "/uploads/other/1710765432_xyz789.pdf",
    "filename": "1710765432_xyz789.pdf"
  }
}
```

---

## 访问已上传文件

上传成功后返回的 `url` 即为可访问地址，例如：

```
http://59.110.64.215:3002/uploads/avatar/1710765432_abc123.jpg
```

直接通过该 URL 即可访问或展示图片/文件。

---

## 部署说明

1. 进入 `upload` 目录：

   ```bash
   cd upload
   ```

2. 安装依赖：

   ```bash
   npm install
   ```

3. 启动服务：

   ```bash
   npm start
   ```

4. 使用 pm2 守护进程（推荐）：

   ```bash
   pm2 start index.js --name upload-service
   pm2 save
   pm2 startup
   ```

5. 确保服务器防火墙开放 3002 端口。

6. 可选：复制 `.env.example` 为 `.env` 修改端口或域名：
   ```bash
   cp .env.example .env
   # 编辑 .env 修改 PORT、HOST 或 BASE_URL
   ```
