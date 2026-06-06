export type ProfileRow = {
  user_id: string
  name: string
  employee_id: string
  department: string
  position: string
  phone: string
  email: string
  avatar_text: string
  updated_at: string
}

export type UpdateProfileBody = {
  name?: string
  employee_id?: string
  department?: string
  position?: string
  phone?: string
  email?: string
  avatar_text?: string
}
