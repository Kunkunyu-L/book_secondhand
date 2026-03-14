<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCouponListApi, addCouponApi, updateCouponApi, deleteCouponApi } from '../api'

const tableData = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)

const defaultForm = {
  id: 0, name: '', type: 'reduction' as string, value: 0,
  min_amount: 0, start_time: '', end_time: '', total_count: 0, status: 1,
}
const form = reactive({ ...defaultForm })

const typeMap: Record<string, string> = { discount: '折扣券', reduction: '满减券' }

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getCouponListApi()
    if (res.status === 200) tableData.value = res.data
  } finally { loading.value = false }
}

const openAdd = () => {
  isEdit.value = false
  Object.assign(form, { ...defaultForm })
  dialogVisible.value = true
}

const openEdit = (row: any) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id, name: row.name, type: row.type,
    value: Number(row.value), min_amount: Number(row.min_amount),
    start_time: row.start_time, end_time: row.end_time,
    total_count: row.total_count, status: row.status,
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name) { ElMessage.warning('请输入优惠券名称'); return }
  if (!form.value) { ElMessage.warning('请设置优惠值'); return }
  if (!form.start_time || !form.end_time) { ElMessage.warning('请设置有效期'); return }
  try {
    const api = isEdit.value ? updateCouponApi : addCouponApi
    const res: any = await api({ ...form })
    if (res.status === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
      dialogVisible.value = false
      loadData()
    }
  } catch { /* error */ }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除优惠券「${row.name}」吗？`, '提示', { type: 'warning' })
    const res: any = await deleteCouponApi({ id: row.id })
    if (res.status === 200) { ElMessage.success('删除成功'); loadData() }
  } catch { /* cancelled */ }
}

const formatValue = (row: any) => {
  if (row.type === 'discount') return `${(row.value * 10).toFixed(1)}折`
  return `减${Number(row.value).toFixed(0)}元`
}

const isExpired = (row: any) => new Date(row.end_time) < new Date()

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <div class="admin-toolbar admin-toolbar-actions-only">
      <div class="admin-toolbar-actions">
        <el-button type="primary" @click="openAdd">
          <el-icon style="margin-right:4px"><Plus /></el-icon>新增优惠券
        </el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column label="类型" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.type === 'discount' ? '' : 'warning'" size="small">{{ typeMap[row.type] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="优惠" width="100" align="center">
        <template #default="{ row }">
          <span style="color:#F56C6C;font-weight:500">{{ formatValue(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="使用门槛" width="100" align="center">
        <template #default="{ row }">{{ row.min_amount > 0 ? `满${Number(row.min_amount).toFixed(0)}元` : '无门槛' }}</template>
      </el-table-column>
      <el-table-column label="发放/使用" width="100" align="center">
        <template #default="{ row }">{{ row.used_count }} / {{ row.total_count || '不限' }}</template>
      </el-table-column>
      <el-table-column label="有效期" min-width="170">
        <template #default="{ row }">
          <div style="font-size:12px">{{ row.start_time?.slice(0, 10) }} ~ {{ row.end_time?.slice(0, 10) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag v-if="isExpired(row)" type="info" size="small">已过期</el-tag>
          <el-tag v-else :type="row.status ? 'success' : 'info'" size="small">{{ row.status ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" text size="small" @click="openEdit(row)">编辑</el-button>
          <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑优惠券' : '新增优惠券'" width="560px" destroy-on-close>
      <el-form :model="form" label-width="90px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="如：新人专享满减券" maxlength="100" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.type">
            <el-radio value="reduction">满减券</el-radio>
            <el-radio value="discount">折扣券</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="form.type === 'discount' ? '折扣率' : '减免金额'">
          <el-input-number v-model="form.value" :min="0"
            :max="form.type === 'discount' ? 1 : 9999"
            :step="form.type === 'discount' ? 0.05 : 1"
            :precision="form.type === 'discount' ? 2 : 0" style="width:200px" />
          <span style="margin-left:8px;color:#909399;font-size:12px">
            {{ form.type === 'discount' ? '如0.8表示八折' : '单位：元' }}
          </span>
        </el-form-item>
        <el-form-item label="最低消费">
          <el-input-number v-model="form.min_amount" :min="0" :precision="0" style="width:200px" />
          <span style="margin-left:8px;color:#909399;font-size:12px">0 = 无门槛</span>
        </el-form-item>
        <el-form-item label="生效时间">
          <el-date-picker v-model="form.start_time" type="datetime" placeholder="开始时间"
            value-format="YYYY-MM-DD HH:mm:ss" style="width:100%" />
        </el-form-item>
        <el-form-item label="过期时间">
          <el-date-picker v-model="form.end_time" type="datetime" placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss" style="width:100%" />
        </el-form-item>
        <el-form-item label="发放总量">
          <el-input-number v-model="form.total_count" :min="0" style="width:200px" />
          <span style="margin-left:8px;color:#909399;font-size:12px">0 = 不限</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
</style>
