import { Injectable } from '@nestjs/common'
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

@Injectable()
export class AuthService {
  // 用容器内部网络拉 JWKS (如 http://keycloak:8080)
  // 不校验 iss,因为客户端 token 的 iss 可能是 http://192.168.x.x:18080 (外部访问地址)
  // 只要签名正确就信任(单一 realm,dev 环境)
  private issuer = process.env.AUTH_ISSUER ?? 'http://keycloak:8080/realms/factory-platform'
  private jwks = createRemoteJWKSet(new URL(`${this.issuer}/protocol/openid-connect/certs`))

  get enabled() {
    return (process.env.AUTH_ENABLED ?? 'true').toLowerCase() !== 'false'
  }

  async verifyAccessToken(token: string): Promise<JWTPayload> {
    // 注意:不传 issuer 选项,以适配不同访问地址(localhost / LAN IP)
    const res = await jwtVerify(token, this.jwks)
    return res.payload
  }
}
