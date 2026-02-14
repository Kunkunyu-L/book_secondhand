<template>
	<view class="register-page">
		<!-- 顶部书籍图标 -->
		<!-- <view class="book-icon"></view> -->

		<!-- 注册容器 -->
		<view class="register-container">
			<h2 class="register-title">加入易书坊</h2>
			
			<!-- 用户名输入 -->
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
					type="password" 
					placeholder="请设置密码" 
					v-model="password"
					maxlength="16"
					placeholder-class="placeholder-style"
				/>
			</view>
			
			<!-- 确认密码输入 -->
			<view class="form-item">
				<input 
					type="password" 
					placeholder="请确认密码" 
					v-model="confirmPwd"
					maxlength="16"
					placeholder-class="placeholder-style"
				/>
			</view>
			
			<!-- 手机号输入 -->
			<view class="form-item">
				<input 
					type="number" 
					placeholder="请输入手机号" 
					v-model="phone"
					maxlength="11"
					placeholder-class="placeholder-style"
				/>
			</view>

			<!-- 验证码输入 -->
			<view class="form-item">
				<input 
					type="text" 
					placeholder="请输入6位验证码" 
					v-model="code"
					maxlength="6"
					placeholder-class="placeholder-style"
				/>
				<text 
					class="code-action" 
					@click="getCode"
					:class="{ disabled: codeDisabled }"
				>{{ codeText }}</text>
			</view>


			<!-- 注册按钮 -->
			<button class="register-btn" @click="handleRegister">注册，交换你的闲置书籍</button>

			<!-- 登录跳转 -->
			<view class="to-login">
				已有账号？<navigator url="/pages/auth/login" class="link">登录，发现更多好书</navigator>
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
			username:'',
			phone: '',
			code: '',
			password: '',
			confirmPwd: '',
			codeDisabled: false, // 验证码按钮禁用状态
			codeText: '获取验证码' // 验证码按钮文字
		};
	},
	methods: {
		// 获取验证码（倒计时）
		getCode() {
			if (this.codeDisabled) return;
			if (!/^1[3-9]\d{9}$/.test(this.phone)) {
				uni.showToast({ title: '请输入正确手机号', icon: 'none' });
				return;
			}

			// 倒计时逻辑
			this.codeDisabled = true;
			let count = 60;
			this.codeText = `${count}s后重发`;
			const timer = setInterval(() => {
				count--;
				this.codeText = `${count}s后重发`;
				if (count <= 0) {
					clearInterval(timer);
					this.codeDisabled = false;
					this.codeText = '获取验证码';
				}
			}, 1000);
		},
		// 注册逻辑（可补充接口请求）
		async handleRegister() {
			// if (!/^1[3-9]\d{9}$/.test(this.phone)) {
			// 	uni.showToast({ title: '请输入正确手机号', icon: 'none' });
			// 	return;
			// }
			if (!this.username || !this.password) return uni.showToast({ title: '请填写您的用户名和密码', icon: 'none' });
			if (!/^[a-zA-Z0-9]+$/.test(this.username)) return uni.showToast({title:'用户名只能包含数字和字母',icon:'none'});
			if (!/^[a-zA-Z0-9]+$/.test(this.username)) return uni.showToast({ title: '用户名长度为5-10个字符', icon: 'none' });
			if (!/^\S{6,12}$/.test(this.password)) return uni.showToast({ title: '密码必须是6-12位非空白字符', icon: 'none' });
			if (this.password !== this.confirmPwd) return uni.showToast({title:'两次密码不一致',icon:'none'})
			if (!/^1[3-9]\d{9}$/.test(this.phone)) return uni.showToast({ title: '请输入正确手机号', icon: 'none' });
			const arr = {
				username:this.username,
				password:this.password,
				phone:this.phone
			}
			try{
				const res = await request({url: '/api/register',method: 'POST',data: arr})
				// console.log(res)
				uni.showToast({title:'注册成功',icon:'success'})
				setTimeout(() => {
					uni.navigateTo({ url: '/pages/auth/login' });
				}, 1500);
			}catch(err){
				console.error('注册失败，请稍后重试！', err);
			}
		}
	}
};
</script>

<style scoped>
/* 页面容器 */
.register-page {
	background: #f9fafc;
	min-height: v-bind(containerHeight);
	box-sizing: border-box;
	padding: 40rpx 30rpx;
	position: relative;
}

/* 顶部*/

/* 注册容器 */
.register-container {
	width: 80%;
	background: #fff;
	border-radius: 32rpx;
	padding: 60rpx 30rpx;
	box-shadow: 0 16rpx 48rpx rgba(149, 157, 165, 0.1);
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%,-55%);
}

/* 标题 */
.register-title {
	font-size: 48rpx;
	font-weight: 600;
	text-align: center;
	margin-bottom: 60rpx;
	color: #333;
}

/* 表单项（与登录页一致） */
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

/* 验证码按钮 */
.code-action {
	position: absolute;
	right: 32rpx;
	top: 28rpx;
	font-size: 28rpx;
	color: #66c2ff;
}
.code-action.disabled {
	color: #ccc;
	pointer-events: none;
}

/* 注册按钮 */
.register-btn {
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
.register-btn::after {
	border: none;
}

/* 登录跳转 */
.to-login {
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