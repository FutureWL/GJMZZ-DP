import Keycloak from 'keycloak-js'

// 让 Keycloak 地址跟随 portal 的访问地址,避免 LAN IP / 不同 hostname 都需要改 realm
const defaultKcUrl =
  typeof window !== 'undefined'
    ? `http://${window.location.hostname}:18080`
    : 'http://sso.corp.aygjm.lan:18080'

const url = import.meta.env.VITE_KEYCLOAK_URL || defaultKcUrl
const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'factory-platform'
const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'portal-ui'

// ---- dev 环境补丁:让 Keycloak 在非 secure context(LAN IP)下也能用 ----
// keycloak-js 26 依赖 crypto.randomUUID (生成 state), 在 http://非 localhost 不可用
// 依赖 crypto.subtle (PKCE S256), 在非 secure context 不可用
// 用 getRandomValues (可用) 补 randomUUID; subtle 不可用时关闭 PKCE
if (typeof window !== 'undefined' && typeof window.crypto !== 'undefined') {
  if (!window.crypto.randomUUID) {
    window.crypto.randomUUID = function randomUUID(): `${string}-${string}-${string}-${string}-${string}` {
      const bytes = new Uint8Array(16)
      window.crypto.getRandomValues(bytes)
      bytes[6] = (bytes[6] & 0x0f) | 0x40
      bytes[8] = (bytes[8] & 0x3f) | 0x80
      const hex: string[] = []
      for (let i = 0; i < 16; i++) hex.push(bytes[i].toString(16).padStart(2, '0'))
      return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}` as `${string}-${string}-${string}-${string}-${string}`
    }
  }
}

export const supportsSubtleCrypto =
  typeof window !== 'undefined' &&
  typeof window.crypto !== 'undefined' &&
  !!window.crypto.subtle

export const keycloak = new Keycloak({ url, realm, clientId })
