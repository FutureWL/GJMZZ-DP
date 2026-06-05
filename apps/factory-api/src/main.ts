import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Factory API')
    .setDescription('Factory platform API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, swaggerDocument)

  const port = Number(process.env.PORT ?? 3001)
  await app.listen(port, '0.0.0.0')
}

bootstrap().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack ?? err.message : String(err)}\n`)
  process.exitCode = 1
})
