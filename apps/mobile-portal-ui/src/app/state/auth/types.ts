export interface User {
  id: string
  name: string
  employeeId: string
  department: string
  position: string
  phone: string
  email: string
  avatarText: string
  roles: string[]
  permissions: string[]
  lastLoginAt: string
  lastLoginIp: string
}

export interface AuthState {
  token: string
  user: User
}
