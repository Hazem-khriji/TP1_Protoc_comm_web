import { Test, TestingModule } from '@nestjs/testing';
import { CvEventType } from '../../cv-event/entities/cv-event.entity';
import { WebhookEventType, WebhookType } from '../entities/webhook.entity';
import { WebhookTriggerService } from './webhook-trigger.service';
import { WebhookService } from './webhook.service';
import { WebhookHttpService } from './webhook-http.service';

describe('WebhookTriggerService', () => {
  let service: WebhookTriggerService;
  let webhookService: {
    findByEventType: jest.Mock;
  };
  let webhookHttpService: {
    callWebhook: jest.Mock;
  };

  beforeEach(async () => {
    webhookService = {
      findByEventType: jest.fn(),
    };

    webhookHttpService = {
      callWebhook: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookTriggerService,
        { provide: WebhookService, useValue: webhookService },
        { provide: WebhookHttpService, useValue: webhookHttpService },
      ],
    }).compile();

    service = module.get<WebhookTriggerService>(WebhookTriggerService);
  });

  it('should trigger all matching webhooks with the mapped payload', async () => {
    webhookService.findByEventType.mockResolvedValue([
      {
        id: 1,
        name: 'HR integration',
        url: 'https://example.com/webhook',
        type: WebhookType.HR_ATS,
        eventTypes: [WebhookEventType.CV_CREATED],
        maxRetries: 3,
        timeoutMs: 5000,
        verifySSL: true,
      },
    ]);

    await service.handleCvEvent({
      type: CvEventType.CREATE,
      cvId: 42,
      cvOwnerId: 7,
      performedById: 3,
      cvSnapshot: {
        id: 42,
        name: 'Doe',
        firstName: 'Jane',
        skillIds: [1, 2],
      },
    });

    expect(webhookService.findByEventType).toHaveBeenCalledWith(
      WebhookEventType.CV_CREATED,
    );
    expect(webhookHttpService.callWebhook).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
      WebhookEventType.CV_CREATED,
      expect.objectContaining<Record<string, unknown>>({
        event: WebhookEventType.CV_CREATED,
        cvId: 42,
        cvOwnerId: 7,
        performedBy: 3,
        cv: expect.objectContaining({
          id: 42,
          name: 'Doe',
          firstName: 'Jane',
          skillIds: [1, 2],
        }),
      }),
    );
  });

  it('should skip delivery when no webhooks are configured for the event', async () => {
    webhookService.findByEventType.mockResolvedValue([]);

    await service.handleCvEvent({
      type: CvEventType.DELETE,
      cvId: 8,
      cvOwnerId: 2,
      performedById: 2,
      cvSnapshot: { id: 8 },
    });

    expect(webhookService.findByEventType).toHaveBeenCalledWith(
      WebhookEventType.CV_DELETED,
    );
    expect(webhookHttpService.callWebhook).not.toHaveBeenCalled();
  });
});
