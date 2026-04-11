import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { Cv } from './entities/cv.entity';
import { User } from '../user/entities/user.entity';
import { Skill } from '../skill/entities/skill.entity';
import { AuthMiddleware } from '../common/middleware/auth.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cv, User, Skill]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'cv', method: RequestMethod.POST },
        { path: 'cv/:id', method: RequestMethod.PATCH },
        { path: 'cv/:id', method: RequestMethod.DELETE },
        { path: 'cv', method: RequestMethod.GET },
      );
  }
}
