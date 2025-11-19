import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { appConfig } from '@config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: appConfig.authentication.port,
        },
      },
    ]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [GatewayController],
  providers: [GatewayService, JwtStrategy],
})
export class GatewayModule {}
