export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type IncidentType = 'quality' | 'equipment' | 'material_shortage' | 'plan' | 'safety' | 'other'
export type IncidentStatus = 'recording' | 'archived'

export type IncidentDto = {
  id: string
  occurredAt: string
  reportedBy: string
  type: IncidentType
  severity: Severity
  status: IncidentStatus
  factoryId: string
  factoryName: string
  line?: string
  workOrderId?: string
  orderId?: string
  equipment?: string
  material?: string
  description: string
  attachments: string[]
  createdAt: string
  updatedAt: string
}

export type CreateIncidentBody = Omit<IncidentDto, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
  status?: IncidentStatus
}

export type UpdateIncidentBody = Partial<Omit<IncidentDto, 'id' | 'createdAt' | 'updatedAt' | 'status'>> & {
  status?: IncidentStatus
}
