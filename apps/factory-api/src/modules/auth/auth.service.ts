import { Injectable } from '@nestjs/common'
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

@Injectable()
export class AuthService {
  private issuer = process.env.AUTH_ISSUER ?? 'http://sso.corp.aygjm.lan:18080/realms/factory-platform'
  private jwks = createRemoteJWKSet(new URL(`${this.issuer}/protocol/openid-connect/certs`))

  get enabled() {
    return (process.env.AUTH_ENABLED ?? 'true').toLowerCase() !== 'false'
  }

  async verifyAccessToken(token: string): Promise<JWTPayload> {
    const res = await jwtVerify(token, this.jwks, { issuer: this.issuer })
    return res.payload
  }
}
