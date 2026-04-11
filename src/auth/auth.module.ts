import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './local.strategy.js';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresInSeconds = Number(
          configService.get<string>('JWT_EXPIRES_IN_SECONDS') ?? 3600,
        );

        return {
          secret: configService.get<string>('JWT_SECRET') ?? 'dev-secret',
          signOptions: {
            expiresIn: Number.isNaN(expiresInSeconds) ? 3600 : expiresInSeconds,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
