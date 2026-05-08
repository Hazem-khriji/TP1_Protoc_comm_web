import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { CvEventPayload } from '../../cv-event/cv-event.service';
import { CvEventType } from '../../cv-event/entities/cv-event.entity';
import { WebhookService } from './webhook.service';
import { WebhookHttpService } from './webhook-http.service';
import { WebhookEventType } from '../entities/webhook.entity';

@Injectable()
export class WebhookTriggerService {
  private readonly logger = new Logger(WebhookTriggerService.name);

  constructor(
    private readonly webhookService: WebhookService,
    private readonly webhookHttpService: WebhookHttpService,
  ) {}

  @OnEvent('cv.persisted')
  async handleCvEvent(payload: CvEventPayload): Promise<void> {
    try {
      // Map CvEventType to WebhookEventType
      const webhookEventType = this.mapCvEventToWebhookEvent(payload.type);

      // Find all active webhooks for this event type
      const webhooks =
        await this.webhookService.findByEventType(webhookEventType);

      if (webhooks.length === 0) {
        this.logger.debug(
          `No webhooks configured for event type: ${webhookEventType}`,
        );
        return;
      }

      // Prepare payload for webhooks
      const webhookPayload = this.prepareWebhookPayload(payload);

      // Call each webhook asynchronously (fire and forget)
      for (const webhook of webhooks) {
        this.webhookHttpService
          .callWebhook(webhook, webhookEventType, webhookPayload)
          .catch((error: unknown) => {
            this.logger.error(
              `Error calling webhook ${webhook.id}: ${this.getErrorMessage(error)}`,
            );
          });
      }

      this.logger.log(
        `Triggered ${webhooks.length} webhooks for event type: ${webhookEventType}`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Error in webhook trigger service: ${this.getErrorMessage(error)}`,
      );
    }
  }

  private mapCvEventToWebhookEvent(cvEventType: CvEventType): WebhookEventType {
    const mapping: Record<CvEventType, WebhookEventType> = {
      [CvEventType.CREATE]: WebhookEventType.CV_CREATED,
      [CvEventType.UPDATE]: WebhookEventType.CV_UPDATED,
      [CvEventType.DELETE]: WebhookEventType.CV_DELETED,
    };

    return mapping[cvEventType];
  }

  private prepareWebhookPayload(
    payload: CvEventPayload,
  ): Record<string, unknown> {
    return {
      event: this.mapCvEventToWebhookEvent(payload.type),
      timestamp: new Date().toISOString(),
      cvId: payload.cvId,
      cvOwnerId: payload.cvOwnerId,
      performedBy: payload.performedById,
      cv: payload.cvSnapshot,
    };
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
