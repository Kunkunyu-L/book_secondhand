try {
  require("dotenv").config();
} catch (_) {}
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || "59.110.64.215";
const BASE_URL = process.env.BASE_URL || `http://${HOST}:${PORT}`;
const UPLOAD_AUTH_KEY = process.env.UPLOAD_AUTH_KEY || "123456Ln@";

// 上传根目录
const UPLOAD_DIR = path.join(__dirname, "uploads");

// 分类目录映射：头像、轮播图、图书图片、logo、发现帖、分类图、平台图书、其他
const TYPE_MAP = {
  avatar: "avatar", // 用户头像
  banner: "banner", // 轮播图
  book: "book", // 图书图片
  logo: "logo", // logo
  discover: "discover", // 发现帖图片
  category: "category", // 分类图片
  platform: "platform", // 平台图书封面
  other: "other", // 其他文件
};

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 初始化所有分类目录
Object.values(TYPE_MAP).forEach((sub) => {
  ensureDir(path.join(UPLOAD_DIR, sub));
});

// 图片 MIME 类型
const IMAGE_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
// 通用文件扩展名白名单（图片 + 常见文档）
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx", ".xls", ".xlsx"];

// 存储配置：按 type 动态设置子目录
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = ((req.query.type || req.body?.type || "other") + "").toLowerCase();
    const subDir = TYPE_MAP[type] || TYPE_MAP.other;
    const dest = path.join(UPLOAD_DIR, subDir);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || "").toLowerCase();
    const safeExt = ALLOWED_EXT.includes(ext) ? ext : ".jpg";
    const name = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}${safeExt}`;
    cb(null, name);
  },
});

// 图片上传：限制 5MB，仅图片
const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (IMAGE_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("仅支持 jpg/png/gif/webp 格式"));
    }
  },
});

// 文件上传：限制 10MB，支持图片和常见文档
const fileUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isImage = IMAGE_MIMES.includes(file.mimetype);
    const isAllowedExt = ALLOWED_EXT.includes(ext);
    if (isImage || isAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error("不支持的文件类型"));
    }
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态托管上传文件，供直接访问
app.use("/uploads", express.static(UPLOAD_DIR));

// 健康检查
app.get("/", (req, res) => {
  res.json({ message: "Upload Service", baseUrl: BASE_URL });
});

// 上传接口鉴权：必须携带 authKey（header/query/body 均可）
function requireAuthKey(req, res, next) {
  const keyFromHeader = req.get("x-auth-key") || req.get("authorization");
  const key =
    (typeof keyFromHeader === "string" && keyFromHeader.replace(/^Bearer\s+/i, "")) ||
    req.query.authKey ||
    req.body?.authKey;

  if (!key || key !== UPLOAD_AUTH_KEY) {
    return res.status(401).json({ status: 401, message: "authKey 无效或缺失", data: null });
  }
  next();
}

/**
 * 图片上传
 * POST /upload/image
 * Query/Body: type = avatar|banner|book|logo|discover|category|platform|other
 * Body: multipart/form-data, field: file
 */
app.post("/upload/image", requireAuthKey, imageUpload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 400, message: "请选择图片", data: null });
  }
  const type = ((req.query.type || req.body?.type || "other") + "").toLowerCase();
  const subDir = TYPE_MAP[type] || TYPE_MAP.other;
  const relativePath = `/uploads/${subDir}/${req.file.filename}`;
  const url = `${BASE_URL}${relativePath}`;
  res.json({
    status: 200,
    message: "上传成功",
    data: { url, path: relativePath, filename: req.file.filename },
  });
});

/**
 * 文件上传（支持图片和文档）
 * POST /upload/file
 * Query/Body: type = avatar|banner|book|logo|discover|category|platform|other
 * Body: multipart/form-data, field: file
 */
app.post("/upload/file", requireAuthKey, fileUpload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 400, message: "请选择文件", data: null });
  }
  const type = ((req.query.type || req.body?.type || "other") + "").toLowerCase();
  const subDir = TYPE_MAP[type] || TYPE_MAP.other;
  const relativePath = `/uploads/${subDir}/${req.file.filename}`;
  const url = `${BASE_URL}${relativePath}`;
  res.json({
    status: 200,
    message: "上传成功",
    data: { url, path: relativePath, filename: req.file.filename },
  });
});

// 统一错误处理
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ status: 400, message: "文件大小超限", data: null });
    }
  }
  res.status(400).json({ status: 400, message: err.message || "上传失败", data: null });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Upload service: http://${HOST}:${PORT}`);
  console.log(`Upload dir: ${UPLOAD_DIR}`);
});
