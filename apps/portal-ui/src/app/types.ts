export type PortalId = 'business' | 'management' | 'production' | 'support' | 'additional'

export type OrgScopeType = 'group' | 'factory' | 'department' | 'line'

export interface OrgScope {
  type: OrgScopeType
  id: string
  name: string
}

