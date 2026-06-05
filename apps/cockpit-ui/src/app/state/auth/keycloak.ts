import Keycloak from 'keycloak-js'

const url = import.meta.env.VITE_KEYCLOAK_URL ?? 'http://sso.corp.aygjm.lan:18080'
const realm = import.meta.env.VITE_KEYCLOAK_REALM ?? 'factory-platform'
const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'cockpit-ui'

export const keycloak = new Keycloak({ url, realm, clientId })
