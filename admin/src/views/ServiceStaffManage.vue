<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getServiceStaffApi, updateServiceStaffApi } from '../api'

const tableData = ref<any[]>([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try { const res: any = await getServiceStaffApi(); if (res.status === 200) tableData.value = res.data }
  finally { loading.value = false }
}

const toggleService = async (row: any) => {
  const newVal = row.is_service ? 0 : 1
  const res: any = await updateServiceStaffApi({ user_id: row.id, is_service: newVal })
  if (res.status === 200) { row.is_service = newVal; ElMessage.success('更新成功') }
}

const updateMaxSessions = async (row: any) => {
  const res: any = await updateServiceStaffApi({ user_id: row.id, service_max_sessions: row.service_max_sessions })
  if (res.status === 200) ElMessage.success('更新成功')
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="60" align="center" />
      <el-table-column label="头像" width="60" align="center">
        <template #default="{ row }"><el-avatar :size="30" :src="row.avatar"><el-icon><User /></el-icon></el-avatar></template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" width="110" />
      <el-table-column prop="nickname" label="昵称" width="110"><template #default="{ row }">{{ row.nickname || '-' }}</template></el-table-column>
      <el-table-column prop="phone" label="手机号" width="120"><template #default="{ row }">{{ row.phone || '-' }}</template></el-table-column>
      <el-table-column label="客服状态" width="100" align="center">
        <template #default="{ row }">
          <el-switch :model-value="!!row.is_service" @change="toggleService(row)" active-text="是" inactive-text="否" />
        </template>
      </el-table-column>
      <el-table-column label="最大接待量" width="130" align="center">
        <template #default="{ row }">
          <el-input-number v-model="row.service_max_sessions" :min="1" :max="50" size="small" style="width:90px" @change="updateMaxSessions(row)" />
        </template>
      </el-table-column>
      <el-table-column label="当前接待" width="90" align="center">
        <template #default="{ row }">
          <span :style="{ color: row.active_sessions >= row.service_max_sessions ? '#F56C6C' : '#303133' }">{{ row.active_sessions }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号状态" width="80" align="center">
        <template #default="{ row }"><el-tag :type="row.status ? 'success' : 'danger'" size="small">{{ row.status ? '正常' : '禁用' }}</el-tag></template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
