<template>
	<view class="register-page">
		<view class="register-container">
			<text class="register-title">注册</text>
			<view class="form-item">
				<input type="text" placeholder="请输入用户名" v-model="username" maxlength="11" placeholder-class="ph" />
			</view>
			<view class="form-item">
				<input type="password" placeholder="请设置密码" v-model="password" maxlength="16" placeholder-class="ph" />
			</view>
			<view class="form-item">
				<input type="password" placeholder="请确认密码" v-model="confirmPwd" maxlength="16" placeholder-class="ph" />
			</view>
			<view class="form-item">
				<input type="number" placeholder="请输入手机号" v-model="phone" maxlength="11" placeholder-class="ph" />
			</view>
			<view class="form-item">
				<input type="text" placeholder="请输入6位验证码" v-model="code" maxlength="6" placeholder-class="ph" />
				<text class="code-action" @click="getCode" :class="{ disabled: codeDisabled }">{{ codeText }}</text>
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
.code-action { position: absolute; right: 28rpx; top: 50%; transform: translateY(-50%); font-size: 26rpx; color: #007AFF; }
.code-action.disabled { color: #ccc; pointer-events: none; }
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