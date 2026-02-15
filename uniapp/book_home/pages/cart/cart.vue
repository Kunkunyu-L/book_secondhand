<template>
  <view class="cart-page" :class="{ 'cart-page--empty': cartList.length === 0 }">
	  <!-- 编辑按钮 -->
	  <view v-if="cartList.length > 0" class="edit-btn-container">
	    <button class="edit-btn" @click="toggleEditMode">
	      {{ isEditMode ? '完成' : '编辑' }}
	    </button>
	  </view>
    <!-- 空购物车状态：占满一屏、不可滑动 -->
    <view v-if="cartList.length === 0" class="empty-cart">
      <uni-icons type="cart" size="120" color="#C0C0C0" />
      <text class="empty-text">购物车还是空的</text>
      <text class="empty-tip">快去挑选几本心仪的书籍吧</text>
      <button class="go-shopping-btn" @click="goToHome">去逛逛</button>
    </view>

    <!-- 购物车列表 -->
    <scroll-view v-else scroll-y class="cart-scroll">
      <!-- 商品列表 -->
      <view class="cart-list">
        <view 
          v-for="item in cartList" 
          :key="item.cart_id" 
          class="cart-item"
        >
          <!-- 选择框 -->
          <view class="item-select" @click="toggleSelect(item)">
            <uni-icons 
              :type="item.selected ? 'checkbox-filled' : 'circle'" 
              :color="item.selected ? '#007AFF' : '#C0C0C0'" 
              size="20"
            />
          </view>

          <!-- 商品信息 -->
          <view class="item-content" @click="goToDetail(item)">
            <image 
              :src="item.cover_img" 
              class="book-image"
              mode="aspectFill"
            />
            <view class="book-info">
              <text class="book-title">{{ item.title }}</text>
              <view class="book-meta">
                <text class="book-author">{{ item.author }}</text>
              </view>
              <text class="book-condition">{{ getConditionText(item.condition) }}</text>
              
              <view class="bottom-section">
                <text class="current-price">¥{{ Number(item.price).toFixed(2) }}</text>
                <view class="quantity-section">
                  <button 
                    class="quantity-btn" 
                    :disabled="item.quantity <= 1"
                    @click.stop="changeQuantity(item, -1)"
                  >
                    <uni-icons type="minus" size="14" color="#666" />
                  </button>
                  <text class="quantity-text">{{ item.quantity }}</text>
                  <button 
                    class="quantity-btn" 
                    :disabled="item.quantity >= item.stock"
                    @click.stop="changeQuantity(item, 1)"
                  >
                    <uni-icons type="plus" size="14" color="#666" />
                  </button>
                </view>
              </view>
            </view>
          </view>

          <!-- 删除按钮 -->
          <view v-if="isEditMode" class="delete-btn" @click="deleteItem(item)">
            <uni-icons type="trash" size="18" color="#FF5500" />
          </view>
        </view>
      </view>

      <!-- 全选和合计栏 -->
      <view class="summary-bar">
        <view class="select-all" @click="toggleSelectAll">
          <uni-icons 
            :type="isAllSelected ? 'checkbox-filled' : 'circle'" 
            :color="isAllSelected ? '#007AFF' : '#C0C0C0'" 
            size="20"
          />
          <text class="select-all-text">全选</text>
        </view>
        
        <view class="total-section">
          <text class="total-label">合计：</text>
          <text class="total-price">¥{{ totalPrice.toFixed(2) }}</text>
        </view>

        <button 
          v-if="!isEditMode" 
          class="settlement-btn" 
          :class="{ 'disabled': selectedCount === 0 }"
          :disabled="selectedCount === 0"
          @click="goToSettlement"
        >
          结算({{ selectedCount }})
        </button>

        <button 
          v-else 
          class="delete-all-btn" 
          :class="{ 'disabled': selectedCount === 0 }"
          :disabled="selectedCount === 0"
          @click="batchDelete"
        >
          删除({{ selectedCount }})
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const cartList = ref([])
const isEditMode = ref(false)

// 加载购物车数据
const loadCartData = async () => {
  try {
    const res = await request({ url: '/cart/list', method: 'GET' })
    cartList.value = (res.data || []).map(item => ({
      ...item,
      selected: item.selected === 1,
      quantity: item.quantity || 1,
      stock: item.stock || 1,
      price: Number(item.price) || 0,
      condition: item.condition || 8
    }))
  } catch (e) {
    console.error('加载购物车失败', e)
  }
}

// 计算属性
const isAllSelected = computed(() => {
  return cartList.value.length > 0 && cartList.value.every(item => item.selected)
})

const selectedCount = computed(() => {
  return cartList.value.filter(item => item.selected).length
})

const totalPrice = computed(() => {
  return cartList.value
    .filter(item => item.selected)
    .reduce((total, item) => total + (item.price * item.quantity), 0)
})

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

const toggleSelect = async (item) => {
  item.selected = !item.selected
  try {
    await request({ url: '/cart/select', method: 'PUT', data: { cart_id: item.cart_id, selected: item.selected ? 1 : 0 } })
  } catch (e) {}
}

const toggleSelectAll = async () => {
  const newState = !isAllSelected.value
  cartList.value.forEach(item => { item.selected = newState })
  try {
    await request({ url: '/cart/selectAll', method: 'PUT', data: { selected: newState ? 1 : 0 } })
  } catch (e) {}
}

const changeQuantity = async (item, delta) => {
  const newQty = item.quantity + delta
  if (newQty < 1 || newQty > item.stock) {
    if (newQty > item.stock) uni.showToast({ title: '库存不足', icon: 'none' })
    return
  }
  item.quantity = newQty
  try {
    await request({ url: '/cart/update', method: 'PUT', data: { cart_id: item.cart_id, quantity: newQty } })
  } catch (e) {}
}

const deleteItem = (item) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这本书吗？',
    confirmColor: '#FF5500',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({ url: '/cart/remove', method: 'DELETE', data: { cart_ids: [item.cart_id] } })
          cartList.value = cartList.value.filter(i => i.cart_id !== item.cart_id)
          uni.showToast({ title: '删除成功', icon: 'success' })
        } catch (e) {}
      }
    }
  })
}

const batchDelete = () => {
  if (selectedCount.value === 0) return
  uni.showModal({
    title: '提示',
    content: `确定要删除选中的${selectedCount.value}件商品吗？`,
    confirmColor: '#FF5500',
    success: async (res) => {
      if (res.confirm) {
        const ids = cartList.value.filter(i => i.selected).map(i => i.cart_id)
        try {
          await request({ url: '/cart/remove', method: 'DELETE', data: { cart_ids: ids } })
          cartList.value = cartList.value.filter(i => !i.selected)
          uni.showToast({ title: '删除成功', icon: 'success' })
        } catch (e) {}
      }
    }
  })
}

const goToSettlement = () => {
  if (selectedCount.value === 0) return
  uni.navigateTo({ url: '/pages/order/confirm' })
}

const goToHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

const goToDetail = (item) => {
  uni.navigateTo({
    url: `/components/detail?bookId=${item.book_id}&bookType=${item.book_type}`
  })
}

const getConditionText = (condition) => {
  if (condition >= 10) return '全新'
  if (condition >= 9) return '九成新'
  if (condition >= 8) return '八成新'
  if (condition >= 7) return '七成新'
  return '六成新以下'
}

onShow(() => {
  const token = uni.getStorageSync('token')
  if (token) {
    loadCartData()
  }
})
</script>

<style scoped>
@import '../../static/css/cart/cart.css'
</style>
