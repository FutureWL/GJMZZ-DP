import Keycloak from 'keycloak-js'

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://sso.corp.aygjm.lan:18080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'factory-platform',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'mobile-app',
}

export const keycloak = new Keycloak(keycloakConfig)
