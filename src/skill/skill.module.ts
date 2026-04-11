import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { SkillService } from './skill.service';
import { SkillController } from './skill.controller';
import { Skill } from './entities/skill.entity';
import { AuthMiddleware } from '../common/middleware/auth.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [SkillController],
  providers: [SkillService],
})
export class SkillModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'skill', method: RequestMethod.POST },
        { path: 'skill/:id', method: RequestMethod.PATCH },
        { path: 'skill/:id', method: RequestMethod.DELETE },
      );
  }
}
