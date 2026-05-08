import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthMiddleware } from '../common/middleware/auth.middleware';
import { AdminGuard } from '../common/guards/admin.guard';
import { Webhook } from './entities/webhook.entity';
import { WebhookCall } from './entities/webhook-call.entity';
import { WebhookService } from './services/webhook.service';
import { WebhookCallService } from './services/webhook-call.service';
import { WebhookHttpService } from './services/webhook-http.service';
import { WebhookTriggerService } from './services/webhook-trigger.service';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Webhook, WebhookCall]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [WebhookController],
  providers: [
    WebhookService,
    WebhookCallService,
    WebhookHttpService,
    WebhookTriggerService,
    AdminGuard,
  ],
  exports: [WebhookService, WebhookCallService],
})
export class WebhookModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'webhooks', method: RequestMethod.ALL },
        { path: 'webhooks/:id', method: RequestMethod.ALL },
        { path: 'webhooks/:id/status', method: RequestMethod.PATCH },
        { path: 'webhooks/:id/calls', method: RequestMethod.GET },
        { path: 'webhooks/:id/calls/:callId', method: RequestMethod.GET },
      );
  }
}
