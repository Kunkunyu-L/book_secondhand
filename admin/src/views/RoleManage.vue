<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRolesApi, saveRoleApi, deleteRoleApi } from '../api'

const tableData = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const defaultForm = { id: 0, name: '', description: '', permissions: [] as string[], status: 1 }
const form = reactive({ ...defaultForm })

const allPermissions = [
  { key: 'dashboard', label: '仪表盘' },
  { key: 'books', label: '书籍管理' },
  { key: 'orders', label: '订单管理' },
  { key: 'users', label: '用户管理' },
  { key: 'transactions', label: '交易管理' },
  { key: 'content', label: '内容管理' },
  { key: 'service', label: '客服管理' },
  { key: 'chat', label: '在线聊天' },
  { key: 'system', label: '系统设置' },
]

const loadData = async () => {
  loading.value = true
  try { const res: any = await getRolesApi(); if (res.status === 200) tableData.value = res.data }
  finally { loading.value = false }
}

const openAdd = () => { isEdit.value = false; Object.assign(form, { ...defaultForm, permissions: [] }); dialogVisible.value = true }
const openEdit = (row: any) => {
  isEdit.value = true
  Object.assign(form, { ...row, permissions: Array.isArray(row.permissions) ? [...row.permissions] : [] })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name) { ElMessage.warning('角色名不能为空'); return }
  const res: any = await saveRoleApi({ ...form })
  if (res.status === 200) { ElMessage.success('保存成功'); dialogVisible.value = false; loadData() }
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`确定删除角色「${row.name}」？`, '提示', { type: 'warning' })
  const res: any = await deleteRoleApi({ id: row.id })
  if (res.status === 200) { ElMessage.success('删除成功'); loadData() }
}

const formatPerms = (perms: any) => {
  if (!Array.isArray(perms)) return '-'
  if (perms.includes('*')) return '全部权限'
  return perms.map(p => allPermissions.find(a => a.key === p)?.label || p).join('、') || '-'
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <div style="margin-bottom:16px">
      <el-button type="primary" @click="openAdd"><el-icon style="margin-right:4px"><Plus /></el-icon>新增角色</el-button>
    </div>
    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="60" align="center" />
      <el-table-column prop="name" label="角色名" width="140" />
      <el-table-column prop="description" label="描述" width="200"><template #default="{ row }">{{ row.description || '-' }}</template></el-table-column>
      <el-table-column label="权限" min-width="250">
        <template #default="{ row }"><span style="font-size:12px">{{ formatPerms(row.permissions) }}</span></template>
      </el-table-column>
      <el-table-column label="状态" width="70" align="center">
        <template #default="{ row }"><el-tag :type="row.status ? 'success' : 'info'" size="small">{{ row.status ? '启用' : '禁用' }}</el-tag></template>
      </el-table-column>
      <el-table-column label="操作" width="130" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" text size="small" @click="openEdit(row)">编辑</el-button>
          <el-button v-if="row.id > 3" type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="520px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-form-item label="角色名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" /></el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="form.permissions">
            <el-checkbox v-for="p in allPermissions" :key="p.key" :value="p.key" :label="p.label" style="margin-bottom:6px" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
