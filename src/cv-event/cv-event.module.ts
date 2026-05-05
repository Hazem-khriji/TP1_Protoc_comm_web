import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CvEvent } from './entities/cv-event.entity';
import { CvEventService } from './cv-event.service';
import { CvEventStreamService } from './cv-event.stream.service';
import { CvEventListener } from './cv-event.listener';
import { CvEventController } from './cv-event.controller';
import { AuthMiddleware } from '../common/middleware/auth.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([CvEvent]), ConfigModule],
  controllers: [CvEventController],
  providers: [CvEventService, CvEventStreamService, CvEventListener],
})
export class CvEventModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'cv-events', method: RequestMethod.GET },
        { path: 'cv-events/stream', method: RequestMethod.GET },
      );
  }
}
