<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRolePagePermissionApi, saveRolePagePermissionApi } from '../api'
import { usePermissionStore } from '../stores/permission'
import type { RoleKey } from '../stores/permission'

const permissionStore = usePermissionStore()
const loading = ref(false)
const saving = ref(false)

const ROLE_LABELS: Record<RoleKey, string> = {
  superAdmin: '超级管理员',
  operationAdmin: '运营管理员',
  customerService: '客服',
  user: '用户',
}

const ALL_PAGES = [
  { path: '/dashboard', title: '仪表盘' },
  { path: '/categories', title: '分类管理' },
  { path: '/platform-books', title: '平台图书' },
  { path: '/user-books', title: '用户图书' },
  { path: '/orders', title: '订单列表' },
  { path: '/refunds', title: '退款/售后' },
  { path: '/order-stats', title: '订单统计' },
  { path: '/users', title: '用户列表' },
  { path: '/violations', title: '违规处理' },
  { path: '/payments', title: '支付记录' },
  { path: '/withdrawals', title: '提现管理' },
  { path: '/coupons', title: '优惠券管理' },
  { path: '/announcements', title: '公告管理' },
  { path: '/banners', title: '轮播图管理' },
  { path: '/discover-posts', title: '帖子管理' },
  { path: '/chat-sessions', title: '在线咨询' },
  { path: '/chat-sessions-manage', title: '会话管理' },
  { path: '/tickets', title: '咨询工单' },
  { path: '/faq-manage', title: '常见问题库' },
  { path: '/system-config', title: '全局设置' },
  { path: '/role-pages', title: '页面权限' },
]

const roles: RoleKey[] = ['superAdmin', 'operationAdmin', 'customerService', 'user']

const isChecked = (role: RoleKey, path: string) => {
  const list = permissionStore.rolePagePermission[role] || []
  return list.includes(path)
}

const toggle = (role: RoleKey, path: string) => {
  const list = [...(permissionStore.rolePagePermission[role] || [])]
  const idx = list.indexOf(path)
  if (idx === -1) list.push(path)
  else list.splice(idx, 1)
  permissionStore.rolePagePermission[role] = list
}

const selectAll = (role: RoleKey, checked: boolean) => {
  permissionStore.rolePagePermission[role] = checked ? ALL_PAGES.map((p) => p.path) : []
}

const load = async () => {
  loading.value = true
  try {
    const res: any = await getRolePagePermissionApi()
    if (res.status === 200 && res.data) permissionStore.setRolePagePermission(res.data)
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    const res: any = await saveRolePagePermissionApi({
      rolePagePermission: permissionStore.rolePagePermission,
    })
    if (res.status === 200) {
      ElMessage.success('保存成功')
    }
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <span>角色页面权限</span>
      <el-button type="primary" style="float: right" :loading="saving" @click="save">保存</el-button>
    </template>
    <p class="tip">勾选表示该角色可访问的后台页面。用户（user）角色不可登录后台，仅作展示。</p>
    <el-table :data="ALL_PAGES" v-loading="loading" border stripe>
      <el-table-column prop="title" label="页面" width="120" />
      <el-table-column prop="path" label="路径" min-width="160" />
      <el-table-column v-for="r in roles" :key="r" :label="ROLE_LABELS[r]" width="140" align="center">
        <template #default="{ row }">
          <el-checkbox
            :model-value="isChecked(r, row.path)"
            @update:model-value="toggle(r, row.path)"
            :disabled="r === 'user'"
          />
        </template>
      </el-table-column>
    </el-table>
    <div class="batch-actions">
      <span class="label">批量：</span>
      <el-button
        v-for="r in roles"
        :key="r"
        size="small"
        @click="selectAll(r, true)"
        :disabled="r === 'user'"
      >
        {{ ROLE_LABELS[r] }}全选
      </el-button>
      <el-button v-for="r in roles" :key="'clear-' + r" size="small" @click="selectAll(r, false)" :disabled="r === 'user'">
        {{ ROLE_LABELS[r] }}清空
      </el-button>
    </div>
  </el-card>
</template>

<style scoped>
.tip {
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 16px;
}
.batch-actions {
  margin-top: 16px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.label {
  font-size: 13px;
  color: #4b5563;
}
</style>
