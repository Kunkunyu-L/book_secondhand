<template>
	<view class="login-page">
		<!-- 顶部书籍图标 -->
		<!-- <view class="book-icon"></view> -->

		<!-- 登录容器 -->
		<view class="login-container">
			<h2 class="login-title">欢迎回来</h2>

			<!-- 手机号输入 -->
			<view class="form-item">
				<input 
					type="text" 
					placeholder="请输入用户名" 
					v-model="username"
					maxlength="11"
					placeholder-class="placeholder-style"
				/>
			</view>

			<!-- 密码输入 -->
			<view class="form-item">
				<input 
					:type="showPwd ? 'text' : 'password'" 
					placeholder="请输入密码" 
					v-model="password"
					maxlength="16"
					placeholder-class="placeholder-style"
				/>
				<text class="pwd-action" @click="togglePwd">{{ showPwd ? '隐藏' : '显示' }}</text>
			</view>

			<!-- 登录按钮 -->
			<button class="login-btn" @click="handleLogin">登录，继续淘书</button>

			<!-- 注册跳转 -->
			<view class="to-register">
				还没有账号？<navigator url="/pages/auth/register" class="link">注册易书坊，开启换书生活</navigator>
			</view>
		</view>
	</view>
</template>

<script>
import request from '@/untils/request.js';
export default {
	onLoad() {
		uni.getSystemInfo({
			success: (res) => {
				// 导航栏高度（单位：px）
				const navBarHeight = res.statusBarHeight + 44; 
				// 给容器设置高度 = 视口高度 - 导航栏高度
				this.containerHeight = `calc(100vh - ${navBarHeight}px)`;
			}
		});
	},
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
			if (!/^[a-zA-Z0-9]+$/.test(this.username)) return uni.showToast({title:'用户名只能包含数字和字母',icon:'none'});
			if (!/^[a-zA-Z0-9]+$/.test(this.username)) return uni.showToast({ title: '用户名长度为5-10个字符', icon: 'none' });
			if (!/^\S{6,12}$/.test(this.password)) return uni.showToast({ title: '密码必须是6-12位非空白字符', icon: 'none' });
			const arr = { username: this.username, password: this.password }
			try {
				const res = await request({url: '/api/login',method: 'POST',data: arr});
				// 登录成功：后端返回的数据在 res 中
				// console.log(res); 
				uni.showToast({ title: res.message || '登录成功', icon: 'success' });
				//保存token
				uni.setStorageSync('token', res.token); 
				// 跳转tabBar页面
				uni.switchTab({ url: '/pages/index/index' }); 
			} catch (err) {
				console.error('登录失败', err);
			}
		}
	}
};
</script>

<style scoped>
/* 页面容器 */
.login-page {
	background: #f9fafc;
	min-height: v-bind(containerHeight);
	padding: 100rpx 30rpx;
	box-sizing: border-box;
	position: relative;
}

/* 顶部 */

/* 登录容器 */
.login-container {
	width: 80%;
	background: #fff;
	border-radius: 32rpx;
	padding: 60rpx 30rpx;
	box-shadow: 0 16rpx 48rpx rgba(149, 157, 165, 0.1);
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -65%);
}

/* 标题 */
.login-title {
	font-size: 48rpx;
	font-weight: 600;
	text-align: center;
	margin-bottom: 60rpx;
	color: #333;
}

/* 表单项 */
.form-item {
	position: relative;
	margin-bottom: 50rpx;
	padding: 24rpx 32rpx;
	border: 2rpx solid #e5f3ff;
	border-radius: 16rpx;
	background: #f7fbff;
}
.form-item input {
	width: 100%;
	font-size: 32rpx;
	color: #333;
	background: transparent;
}
.placeholder-style {
	color: #a0cfff;
	font-size: 32rpx;
}

/* 密码可见性按钮 */
.pwd-action {
	position: absolute;
	right: 32rpx;
	top: 28rpx;
	font-size: 28rpx;
	color: #66c2ff;
}

/* 登录按钮 */
.login-btn {
	width: 100%;
	height: 96rpx;
	line-height: 96rpx;
	background: linear-gradient(120deg, #66c2ff, #4da8ff);
	color: #fff;
	border: none;
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: 500;
	box-shadow: 0 8rpx 24rpx rgba(102, 194, 255, 0.3);
}
.login-btn::after {
	border: none;
}

/* 注册跳转 */
.to-register {
	text-align: center;
	margin-top: 40rpx;
	font-size: 28rpx;
	color: #999;
}
.link {
	color: #4da8ff;
	font-weight: 500;
	text-decoration: none;
}
</style>