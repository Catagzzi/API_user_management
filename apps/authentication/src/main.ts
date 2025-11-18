import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthenticationModule } from './authentication.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthenticationModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: parseInt(process.env.AUTH_SERVICE_PORT ?? '3001'),
      },
    },
  );

  await app.listen();
  console.log('Authentication running on TCP port 3001');
}
bootstrap();
