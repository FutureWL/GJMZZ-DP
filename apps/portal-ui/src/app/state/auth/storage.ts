import type { AuthState, User } from './types'

const STORAGE_KEY = 'portal-ui:auth'

export function readAuthState(): AuthState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as AuthState
    if (!parsed?.token || !parsed?.user?.id) return null
    return parsed
  } catch {
    return null
  }
}

export function writeAuthState(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearAuthState() {
  localStorage.removeItem(STORAGE_KEY)
}

export function buildMockUser(params: {
  username: string
  loginAt: string
  loginIp: string
}): User {
  const baseName = params.username.trim() || '用户'
  const avatarText = baseName.slice(0, 1).toUpperCase()
  return {
    id: 'U-001',
    name: baseName,
    employeeId: 'E-0001',
    department: '制造中心',
    position: '制造工程师',
    phone: '13800000000',
    email: 'user@example.com',
    avatarText,
    roles: ['生产经理', '质量查看', '采购查看'],
    permissions: [
      'production:overview:read',
      'production:alarms:read',
      'production:workorders:read',
      'management:procurement:read',
      'support:it:read',
    ],
    lastLoginAt: params.loginAt,
    lastLoginIp: params.loginIp,
  }
}

