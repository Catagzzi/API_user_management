import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { appConfig } from '@config';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(appConfig.gateway.port);
  console.log(`Gateway running on http://localhost:${appConfig.gateway.port}`);
}
bootstrap();
