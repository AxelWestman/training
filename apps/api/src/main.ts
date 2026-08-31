import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const envPath = resolve(process.cwd(), '../../.env');
if (existsSync(envPath)) {
  config({ path: envPath });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  app.use(cookieParser());
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Gym Management API')
    .setDescription(
      'Admin panel API for members, memberships, exercises, routines, payments, and attendance.',
    )
    .setVersion('1.0')
    .addCookieAuth('session')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
void bootstrap();
