import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getRolePagePermissionApi } from '@/api'

export type RoleKey = 'superAdmin' | 'operationAdmin' | 'customerService' | 'user'

export const usePermissionStore = defineStore('permission', () => {
  const rolePagePermission = ref<Record<RoleKey, string[]>>({
    superAdmin: [],
    operationAdmin: [],
    customerService: [],
    user: [],
  })

  const setRolePagePermission = (data: Record<string, string[]>) => {
    rolePagePermission.value = {
      superAdmin: data.superAdmin || [],
      operationAdmin: data.operationAdmin || [],
      customerService: data.customerService || [],
      user: data.user || [],
    }
  }

  const loadRolePagePermission = async () => {
    const res: any = await getRolePagePermissionApi()
    if (res.status === 200 && res.data) setRolePagePermission(res.data)
  }

  const canAccess = (path: string, role: string) => {
    const allowed = rolePagePermission.value[role as RoleKey] || []
    return allowed.some((p) => path === p || path.startsWith(p + '/'))
  }

  return { rolePagePermission, setRolePagePermission, loadRolePagePermission, canAccess }
})
