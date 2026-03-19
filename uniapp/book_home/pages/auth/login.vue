<template>
	<view class="login-page">
		<view class="login-container">
			<text class="login-title">欢迎回来</text>
			<view class="form-item">
				<input type="text" placeholder="请输入用户名" v-model="username" maxlength="11" placeholder-class="ph" />
			</view>
			<view class="form-item">
				<input :type="showPwd ? 'text' : 'password'" placeholder="请输入密码" v-model="password" maxlength="16" placeholder-class="ph" />
				<text class="pwd-action" @click="togglePwd">{{ showPwd ? '隐藏' : '显示' }}</text>
			</view>
			<button class="login-btn" @click="handleLogin">登录</button>
			<view class="to-register">
				还没有账号？<navigator url="/pages/auth/register" class="link">去注册</navigator>
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
			password: '',
			showPwd: false // 密码可见性
		};
	},
	methods: {
		// 切换密码可见性
		togglePwd() {
			this.showPwd = !this.showPwd;
		},
		//登录按钮被点击
		async handleLogin() {
			if (!this.username || !this.password) return uni.showToast({ title: '请填写您的用户名和密码', icon: 'none' });
			if (!/^[a-zA-Z0-9]+$/.test(this.username)) return uni.showToast({ title: '用户名只能包含数字和字母', icon: 'none' });
			if (!/^\S{6,12}$/.test(this.password)) return uni.showToast({ title: '密码必须是6-12位非空白字符', icon: 'none' });
			const arr = { username: this.username, password: this.password }
			try {
				const res = await request({ url: '/api/login', method: 'POST', data: arr });
				uni.setStorageSync('token', res.token);
				// 登录成功后获取并缓存用户信息（聊天页面识别自己消息需要）
				try {
					const info = await request({ url: '/my/getUserInfo', method: 'GET' });
					if (info.data) uni.setStorageSync('userInfo', info.data);
				} catch (e) {}
				uni.showToast({ title: '登录成功', icon: 'success' });
				// 返回上一页或跳转首页
				const pages = getCurrentPages();
				if (pages.length > 1) {
					uni.navigateBack();
				} else {
					uni.switchTab({ url: '/pages/index/index' });
				}
			} catch (err) {
				console.error('登录失败', err);
			}
		}
	}
};
</script>

<style scoped>
.login-page {
	background: #f5f5f5;
	height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 60rpx 48rpx;
	box-sizing: border-box;
}
.login-container {
	width: 100%;
	max-width: 560rpx;
	background: #fff;
	border-radius: 24rpx;
	padding: 64rpx 40rpx;
	box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.06);
}
.login-title {
	display: block;
	font-size: 44rpx;
	font-weight: 600;
	text-align: center;
	margin-bottom: 56rpx;
	color: #333;
}
.form-item {
	position: relative;
	margin-bottom: 32rpx;
	padding: 24rpx 28rpx;
	border: 1rpx solid #eee;
	border-radius: 12rpx;
	background: #fafafa;
}
.form-item input { width: 100%; font-size: 30rpx; color: #333; background: transparent; }
.ph { color: #999; font-size: 30rpx; }
.pwd-action { position: absolute; right: 28rpx; top: 50%; transform: translateY(-50%); font-size: 26rpx; color: #007AFF; }
.login-btn {
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
.login-btn::after { border: none; }
.to-register { text-align: center; margin-top: 36rpx; font-size: 26rpx; color: #999; }
.link { color: #007AFF; font-weight: 500; text-decoration: none; }
</style>