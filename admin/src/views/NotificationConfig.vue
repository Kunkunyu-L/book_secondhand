<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getNotificationTemplatesApi, saveNotificationTemplateApi, deleteNotificationTemplateApi,
  sendNotificationApi } from '../api'

const templates = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const sendDialogVisible = ref(false)
const isEdit = ref(false)
const defaultForm = { id: 0, name: '', type: 'in_app' as string, subject: '', content: '', variables: '', status: 1 }
const form = reactive({ ...defaultForm })
const sendForm = reactive({ user_id: 0, title: '', content: '', type: 'system' })

const typeMap: Record<string, string> = { sms: '短信', email: '邮件', in_app: '站内信' }

const loadTemplates = async () => {
  loading.value = true
  try { const res: any = await getNotificationTemplatesApi(); if (res.status === 200) templates.value = res.data }
  finally { loading.value = false }
}

const openAdd = () => { isEdit.value = false; Object.assign(form, { ...defaultForm }); dialogVisible.value = true }
const openEdit = (row: any) => { isEdit.value = true; Object.assign(form, { ...row }); dialogVisible.value = true }

const handleSubmit = async () => {
  if (!form.name || !form.content) { ElMessage.warning('名称和内容不能为空'); return }
  const res: any = await saveNotificationTemplateApi({ ...form })
  if (res.status === 200) { ElMessage.success('保存成功'); dialogVisible.value = false; loadTemplates() }
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`确定删除「${row.name}」？`, '提示', { type: 'warning' })
  const res: any = await deleteNotificationTemplateApi({ id: row.id })
  if (res.status === 200) { ElMessage.success('删除成功'); loadTemplates() }
}

const openSendDialog = () => {
  Object.assign(sendForm, { user_id: 0, title: '', content: '', type: 'system' })
  sendDialogVisible.value = true
}

const handleSend = async () => {
  if (!sendForm.title) { ElMessage.warning('标题不能为空'); return }
  const res: any = await sendNotificationApi({ ...sendForm })
  if (res.status === 200) { ElMessage.success('发送成功'); sendDialogVisible.value = false }
}

onMounted(() => { loadTemplates() })
</script>

<template>
  <div>
    <!-- 通知模板 -->
    <el-card shadow="never" style="margin-bottom:20px">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:600">通知模板</span>
          <el-button type="primary" size="small" @click="openAdd"><el-icon style="margin-right:4px"><Plus /></el-icon>新增模板</el-button>
        </div>
      </template>
      <el-table :data="templates" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="name" label="模板名" width="150" />
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }"><el-tag size="small">{{ typeMap[row.type] || row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="subject" label="标题" width="160" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="variables" label="变量" width="140" show-overflow-tooltip />
        <el-table-column label="状态" width="70" align="center">
          <template #default="{ row }"><el-tag :type="row.status ? 'success' : 'info'" size="small">{{ row.status ? '启用' : '禁用' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 手动发送通知 -->
    <el-card shadow="never">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:600">手动发送通知</span>
          <el-button type="primary" size="small" @click="openSendDialog">发送站内通知</el-button>
        </div>
      </template>
      <p style="color:#909399;font-size:13px">可向指定用户或全部用户发送站内通知（user_id 设为 0 即全部用户）</p>
    </el-card>

    <!-- 模板编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑模板' : '新增模板'" width="600px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width:100%">
            <el-option label="站内信" value="in_app" /><el-option label="短信" value="sms" /><el-option label="邮件" value="email" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题"><el-input v-model="form.subject" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="5" placeholder="支持变量如 {{username}}" /></el-form-item>
        <el-form-item label="变量说明"><el-input v-model="form.variables" placeholder="如 username, order_no" /></el-form-item>
        <el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>

    <!-- 发送通知弹窗 -->
    <el-dialog v-model="sendDialogVisible" title="发送站内通知" width="500px" destroy-on-close>
      <el-form :model="sendForm" label-width="80px">
        <el-form-item label="用户ID">
          <el-input-number v-model="sendForm.user_id" :min="0" style="width:100%" />
          <div style="font-size:12px;color:#909399;margin-top:4px">0 = 全部用户</div>
        </el-form-item>
        <el-form-item label="标题"><el-input v-model="sendForm.title" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="sendForm.content" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="sendForm.type" style="width:100%">
            <el-option label="系统通知" value="system" /><el-option label="订单通知" value="order" /><el-option label="促销通知" value="promotion" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="sendDialogVisible=false">取消</el-button><el-button type="primary" @click="handleSend">发送</el-button></template>
    </el-dialog>
  </div>
</template>
