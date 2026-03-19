<template>
  <view class="withdraw-page">
    <!-- 余额卡片 -->
    <view class="balance-card">
      <text class="balance-label">当前可用余额</text>
      <text class="balance-amount">¥{{ Number(balance).toFixed(2) }}</text>
      <text class="balance-tip">余额来源：卖出用户图书收益</text>
    </view>

    <!-- 提现表单 -->
    <view class="form-card">
      <view class="form-title">申请提现</view>

      <view class="form-item">
        <text class="form-label">提现金额</text>
        <view class="amount-input-wrap">
          <text class="amount-prefix">¥</text>
          <input
            class="amount-input"
            type="digit"
            v-model="amount"
            placeholder="请输入提现金额"
            @input="onAmountInput"
          />
          <text class="amount-all" @click="fillAll">全部提现</text>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">收款账户</text>
        <textarea
          class="account-input"
          v-model="accountInfo"
          placeholder="请填写收款信息，如：支付宝 13800138000 / 微信 wxid / 银行卡 6228xxxx 开户行"
          maxlength="200"
          :auto-height="true"
        />
      </view>

      <text class="warn-tip" v-if="amountError">{{ amountError }}</text>

      <button class="submit-btn" @click="submitWithdraw" :disabled="submitting">
        {{ submitting ? '提交中...' : '立即申请' }}
      </button>
    </view>

    <!-- 提现记录 -->
    <view class="record-card" v-if="records.length > 0">
      <view class="record-title">提现记录</view>
      <view class="record-item" v-for="item in records" :key="item.id">
        <view class="record-left">
          <text class="record-amount">¥{{ Number(item.amount).toFixed(2) }}</text>
          <text class="record-account">{{ item.account_info }}</text>
        </view>
        <view class="record-right">
          <view class="record-status" :class="'status-' + item.status">
            {{ statusLabel[item.status] || item.status }}
          </view>
          <text class="record-time">{{ item.created_at ? item.created_at.slice(0, 10) : '' }}</text>
          <text class="record-note" v-if="item.admin_note">备注：{{ item.admin_note }}</text>
        </view>
      </view>
    </view>
    <view v-else class="no-record">暂无提现记录</view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const balance = ref(0)
const amount = ref('')
const accountInfo = ref('')
const submitting = ref(false)
const amountError = ref('')
const records = ref([])

const statusLabel = {
  pending: '审核中',
  approved: '已通过',
  rejected: '已驳回',
}

onShow(() => {
  loadBalance()
  loadRecords()
})

const loadBalance = async () => {
  try {
    const res = await request({ url: '/client/balance', method: 'GET' })
    balance.value = res.data?.balance || 0
  } catch (e) {}
}

const loadRecords = async () => {
  try {
    const res = await request({ url: '/client/withdrawals', method: 'GET' })
    records.value = res.data || []
  } catch (e) {}
}

const fillAll = () => {
  amount.value = String(Number(balance.value).toFixed(2))
  amountError.value = ''
}

const onAmountInput = () => {
  amountError.value = ''
}

const submitWithdraw = async () => {
  const amt = parseFloat(amount.value)
  if (!amount.value || isNaN(amt) || amt <= 0) {
    amountError.value = '请输入正确的提现金额'
    return
  }
  if (amt > parseFloat(balance.value)) {
    amountError.value = '提现金额不能超过余额'
    return
  }
  if (!accountInfo.value.trim()) {
    uni.showToast({ title: '请填写收款账户信息', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await request({
      url: '/client/withdraw',
      method: 'POST',
      data: { amount: amt, account_info: accountInfo.value.trim() }
    })
    uni.showToast({ title: '提现申请已提交', icon: 'success' })
    amount.value = ''
    accountInfo.value = ''
    await loadBalance()
    await loadRecords()
  } catch (e) {}
  submitting.value = false
}
</script>

<style scoped>
.withdraw-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}
.balance-card {
  background: linear-gradient(135deg, #52C41A, #73D13D);
  padding: 48rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}
.balance-label {
  font-size: 26rpx;
  color: rgba(255,255,255,0.85);
}
.balance-amount {
  font-size: 60rpx;
  font-weight: bold;
  color: #fff;
}
.balance-tip {
  font-size: 22rpx;
  color: rgba(255,255,255,0.7);
}
.form-card {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}
.form-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}
.form-item {
  margin-bottom: 24rpx;
}
.form-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}
.amount-input-wrap {
  display: flex;
  align-items: center;
  border: 1rpx solid #e8e8e8;
  border-radius: 10rpx;
  padding: 16rpx 20rpx;
}
.amount-prefix {
  font-size: 32rpx;
  color: #ff4d4f;
  font-weight: bold;
  margin-right: 8rpx;
}
.amount-input {
  flex: 1;
  font-size: 32rpx;
  color: #333;
}
.amount-all {
  font-size: 24rpx;
  color: #FF5722;
  padding-left: 16rpx;
}
.account-input {
  width: 100%;
  min-height: 120rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 10rpx;
  padding: 16rpx 20rpx;
  font-size: 26rpx;
  color: #333;
  box-sizing: border-box;
}
.warn-tip {
  font-size: 24rpx;
  color: #ff4d4f;
  display: block;
  margin-bottom: 16rpx;
}
.submit-btn {
  width: 100%;
  background: #52C41A;
  color: #fff;
  font-size: 30rpx;
  padding: 22rpx 0;
  border-radius: 12rpx;
  border: none;
  margin-top: 8rpx;
}
.submit-btn[disabled] { opacity: 0.6; }
.record-card {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}
.record-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}
.record-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.record-item:last-child { border-bottom: none; }
.record-left { flex: 1; }
.record-amount { font-size: 32rpx; font-weight: bold; color: #333; display: block; }
.record-account { font-size: 22rpx; color: #999; display: block; margin-top: 4rpx; max-width: 300rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.record-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4rpx; }
.record-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}
.status-pending { background: #FFF7E6; color: #FA8C16; }
.status-approved { background: #F6FFED; color: #52C41A; }
.status-rejected { background: #FFF1F0; color: #FF4D4F; }
.record-time { font-size: 20rpx; color: #ccc; }
.record-note { font-size: 20rpx; color: #999; }
.no-record { text-align: center; color: #ccc; font-size: 26rpx; padding: 40rpx; }
</style>
