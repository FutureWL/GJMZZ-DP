export type PortalId = 'main'

export type OrgScopeType = 'group' | 'factory' | 'department' | 'line'

export interface OrgScope {
  type: OrgScopeType
  id: string
  name: string
}
