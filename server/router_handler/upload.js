const multer = require("multer");
const FormData = require("form-data");
const axios = require("axios");
const { Readable } = require("stream");

// 上传服务配置（与 upload/API.md 一致）
const UPLOAD_SERVICE = process.env.UPLOAD_SERVICE_URL || "http://59.110.64.215:3002";
const UPLOAD_AUTH_KEY = process.env.UPLOAD_AUTH_KEY || "123456Ln@";

// 允许的 type（与 upload/API.md 一致）
const TYPE_MAP = {
  avatar: "avatar",
  book: "book",
  banner: "banner",
  category: "category",
  logo: "logo",
  discover: "discover",
  platform: "platform",
  other: "other",
};

// 图片上传：内存存储，5MB
const imageMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("仅支持 jpg/png/gif/webp 格式"));
    }
  },
}).single("file");

// 文件上传：内存存储，10MB（支持图片+文档）
const fileMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("不支持的文件类型"));
    }
  },
}).single("file");

/**
 * 转发文件到 upload 服务
 */
async function forwardToUploadService(req, res, endpoint) {
  if (!req.file) return res.cc("请选择文件", 400);

  const type = (req.query.type || req.body?.type || "other").toLowerCase();
  const subDir = TYPE_MAP[type] || "other";

  const form = new FormData();
  form.append("file", Readable.from(req.file.buffer), {
    filename: req.file.originalname || "file",
    contentType: req.file.mimetype,
  });
  form.append("type", subDir);
  form.append("authKey", UPLOAD_AUTH_KEY);

  try {
    const uploadRes = await axios.post(`${UPLOAD_SERVICE}/upload/${endpoint}?type=${subDir}`, form, {
      headers: {
        ...form.getHeaders(),
        "x-auth-key": UPLOAD_AUTH_KEY,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 30000,
    });

    const data = uploadRes.data;
    if (data.status !== 200) {
      return res.cc(data.message || "上传失败", 400);
    }
    res.send(data);
  } catch (err) {
    if (err.response?.data?.message) {
      return res.cc(err.response.data.message, 400);
    }
    if (err.code === "ECONNREFUSED") {
      return res.cc("上传服务不可用", 503);
    }
    return res.cc(err.message || "上传失败", 500);
  }
}

/**
 * 图片上传：转发到 upload 服务
 */
exports.uploadImage = (req, res, next) => {
  imageMulter(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") return res.cc("图片不能超过 5MB", 400);
      }
      return res.cc(err.message || "上传失败", 400);
    }
    forwardToUploadService(req, res, "image");
  });
};

/**
 * 文件上传：转发到 upload 服务
 */
exports.uploadFile = (req, res, next) => {
  fileMulter(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") return res.cc("文件不能超过 10MB", 400);
      }
      return res.cc(err.message || "上传失败", 400);
    }
    forwardToUploadService(req, res, "file");
  });
};
