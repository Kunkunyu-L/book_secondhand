<template>
	<view class="register-page">
		<view class="register-container">
			<text class="register-title">注册</text>
			<view class="form-item">
				<input type="text" placeholder="请输入用户名（5-10位字母数字）" v-model="username" maxlength="10" placeholder-class="ph" />
			</view>
			<view class="form-item">
				<input type="password" placeholder="请设置密码（6-12位）" v-model="password" maxlength="12" placeholder-class="ph" />
			</view>
			<view class="form-item">
				<input type="password" placeholder="请确认密码" v-model="confirmPwd" maxlength="12" placeholder-class="ph" />
			</view>
			<view class="form-item">
				<input type="number" placeholder="请输入手机号" v-model="phone" maxlength="11" placeholder-class="ph" />
			</view>
			<view class="form-item captcha-item">
				<text class="captcha-question">{{ captchaQuestion || '点击获取验证码' }}</text>
				<text class="code-action" @click="fetchCaptcha">{{ captchaQuestion ? '换一题' : '获取验证码' }}</text>
			</view>
			<view class="form-item">
				<input type="number" placeholder="请输入计算结果" v-model="captchaValue" maxlength="4" placeholder-class="ph" />
			</view>
			<button class="register-btn" @click="handleRegister">注册</button>
			<view class="to-login">
				已有账号？<navigator url="/pages/auth/login" class="link">去登录</navigator>
			</view>
		</view>
	</view>
</template>

<script>
import request from '@/untils/request.js';
export default {
	data() {
		return {
			username: '',
			phone: '',
			password: '',
			confirmPwd: '',
			captchaToken: '',
			captchaQuestion: '',
			captchaValue: ''
		};
	},
	onLoad() {
		this.fetchCaptcha();
	},
	methods: {
		async fetchCaptcha() {
			try {
				const res = await request({ url: '/api/captcha', method: 'GET' });
				if (res.status === 200 && res.data) {
					this.captchaToken = res.data.token;
					this.captchaQuestion = res.data.question;
					this.captchaValue = '';
				}
			} catch (e) {
				uni.showToast({ title: '获取验证码失败', icon: 'none' });
			}
		},
		async handleRegister() {
			if (!this.username || !this.password) return uni.showToast({ title: '请填写用户名和密码', icon: 'none' });
			if (!/^[a-zA-Z0-9]{5,10}$/.test(this.username)) return uni.showToast({ title: '用户名需5-10位字母数字', icon: 'none' });
			if (!/^\S{6,12}$/.test(this.password)) return uni.showToast({ title: '密码必须是6-12位非空白字符', icon: 'none' });
			if (this.password !== this.confirmPwd) return uni.showToast({ title: '两次密码不一致', icon: 'none' });
			if (!/^1[3-9]\d{9}$/.test(this.phone)) return uni.showToast({ title: '请输入正确手机号', icon: 'none' });
			if (!this.captchaToken) return uni.showToast({ title: '请先获取验证码', icon: 'none' });
			if (!this.captchaValue) return uni.showToast({ title: '请输入验证码结果', icon: 'none' });
			try {
				await request({
					url: '/api/register',
					method: 'POST',
					data: {
						username: this.username,
						password: this.password,
						phone: this.phone,
						captchaToken: this.captchaToken,
						captchaValue: this.captchaValue
					}
				});
				uni.showToast({ title: '注册成功', icon: 'success' });
				setTimeout(() => {
					uni.navigateTo({ url: '/pages/auth/login' });
				}, 1500);
			} catch (err) {
				// 验证码错误时刷新
				this.fetchCaptcha();
				console.error('注册失败', err);
			}
		}
	}
};
</script>

<style scoped>
.register-page {
	background: #f5f5f5;
	height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx 48rpx;
	box-sizing: border-box;
}
.register-container {
	width: 100%;
	max-width: 560rpx;
	background: #fff;
	border-radius: 24rpx;
	padding: 56rpx 40rpx;
	box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.06);
}
.register-title {
	display: block;
	font-size: 44rpx;
	font-weight: 600;
	text-align: center;
	margin-bottom: 48rpx;
	color: #333;
}
.form-item {
	position: relative;
	margin-bottom: 28rpx;
	padding: 24rpx 28rpx;
	border: 1rpx solid #eee;
	border-radius: 12rpx;
	background: #fafafa;
}
.form-item input { width: 100%; font-size: 30rpx; color: #333; background: transparent; }
.ph { color: #999; font-size: 30rpx; }
.captcha-item { display: flex; align-items: center; justify-content: space-between; }
.captcha-question { font-size: 30rpx; color: #333; font-weight: 500; flex: 1; }
.code-action { font-size: 26rpx; color: #007AFF; white-space: nowrap; margin-left: 16rpx; }
.register-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background: #007AFF;
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 30rpx;
	font-weight: 500;
	margin-top: 16rpx;
}
.register-btn::after { border: none; }
.to-login { text-align: center; margin-top: 36rpx; font-size: 26rpx; color: #999; }
.link { color: #007AFF; font-weight: 500; text-decoration: none; }
</style>