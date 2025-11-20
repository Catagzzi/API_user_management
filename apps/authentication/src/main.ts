import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthenticationModule } from './authentication.module';
import { appConfig } from '@config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthenticationModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: appConfig.authentication.port,
      },
    },
  );

  await app.listen();
  console.log(
    `Authentication running on TCP port ${appConfig.authentication.port}`,
  );
}
bootstrap();
