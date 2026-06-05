import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import 'dotenv/config'

import { AppModule } from './modules/app/app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger: ['log', 'error', 'warn'] },
  )

  app.enableCors({
    origin: true,
    credentials: true,
  })

  const port = Number(process.env.PORT ?? 3001)
  await app.listen(port, '0.0.0.0')
}

bootstrap().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack ?? err.message : String(err)}\n`)
  process.exitCode = 1
})
