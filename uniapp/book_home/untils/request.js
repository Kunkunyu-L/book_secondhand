// 基础配置（真机调试时请修改 untils/config.js 中的 baseURL 为电脑局域网 IP）
import { baseURL } from './config.js';

const timeout = 15000;

// 请求拦截器（发起请求前执行）
function requestInterceptor(config) {
  // 1. 添加 Token
  const token = uni.getStorageSync('token');
  if (token) {
    config.header = config.header || {};
    config.header['Authorization'] = token.startsWith('Bearer ') ? token : 'Bearer ' + token;
  }
  // 2. 显示加载动画
  uni.showLoading({ title: '加载中...' });
  return config;
}

// 响应拦截器（收到响应后执行）
function responseInterceptor(response) {
  uni.hideLoading();
  const res = response.data;

  // 业务错误：用后端返回的 message 提示
  if (res.status !== 200) {
    uni.showToast({ 
      title: res.message || '操作失败', // 直接使用后端的 message
      icon: 'none' 
    });
    return Promise.reject(res); // 失败时返回完整错误信息
  }

  // 业务成功：不重复提示（由页面逻辑决定是否提示）
  return res; // 成功时返回完整数据（包含 token 等）
}

// 错误拦截器（请求失败时执行）
function errorInterceptor(error) {
  uni.hideLoading();
  uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' });
  return Promise.reject(error);
}

// 核心请求方法
export default function request(options) {
  // 拼接完整 URL
  options.url = baseURL + options.url;
  // 设置超时时间
  options.timeout = timeout;
  // 执行请求拦截器
  const config = requestInterceptor(options);
  
  return new Promise((resolve, reject) => {
    uni.request({
      ...config,
      success: (response) => {
        // 执行响应拦截器
        resolve(responseInterceptor(response));
      },
      fail: (error) => {
        // 执行错误拦截器
        reject(errorInterceptor(error));
      }
    });
  });
}