import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Agent as HttpsAgent } from 'https';
import { firstValueFrom } from 'rxjs';
import { Webhook } from '../entities/webhook.entity';
import {
  WebhookCall,
  WebhookCallStatus,
} from '../entities/webhook-call.entity';
import { WebhookCallService } from './webhook-call.service';

@Injectable()
export class WebhookHttpService {
  private readonly logger = new Logger(WebhookHttpService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly webhookCallService: WebhookCallService,
  ) {}

  async callWebhook(
    webhook: Webhook,
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<WebhookCall> {
    // Create initial call record
    let call = await this.webhookCallService.create(
      webhook.id,
      eventType,
      payload,
    );

    try {
      // Attempt to call the webhook
      call = await this.executeCall(webhook, call, payload);
      return call;
    } catch (error: unknown) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error(
        `Failed to call webhook ${webhook.id}: ${errorMessage}`,
      );
      call = await this.webhookCallService.updateStatus(
        call.id,
        WebhookCallStatus.FAILED,
        undefined,
        undefined,
        errorMessage,
      );
      return call;
    }
  }

  private async executeCall(
    webhook: Webhook,
    call: WebhookCall,
    payload: Record<string, unknown>,
  ): Promise<WebhookCall> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < webhook.maxRetries; attempt++) {
      try {
        const response = await firstValueFrom(
          this.httpService.post(webhook.url, payload, {
            timeout: webhook.timeoutMs,
            headers: webhook.headers || {},
            httpsAgent: new HttpsAgent({
              rejectUnauthorized: webhook.verifySSL,
            }),
            validateStatus: () => true, // Accept all status codes
          }),
        );

        // Consider 2xx and 3xx as success
        if (response.status >= 200 && response.status < 400) {
          this.logger.log(
            `Webhook ${webhook.id} called successfully (attempt ${attempt + 1})`,
          );

          return this.webhookCallService.updateStatus(
            call.id,
            WebhookCallStatus.SUCCESS,
            response.status,
            JSON.stringify(response.data),
          );
        }

        // 4xx and 5xx errors
        lastError = new Error(
          `HTTP ${response.status}: ${JSON.stringify(response.data)}`,
        );

        if (response.status >= 400 && response.status < 500) {
          // Don't retry 4xx errors
          break;
        }

        // Retry on 5xx errors
        if (attempt < webhook.maxRetries - 1) {
          await this.webhookCallService.incrementRetry(call.id);
          const backoffMs = Math.pow(2, attempt) * 1000; // Exponential backoff
          await this.sleep(backoffMs);
        }
      } catch (error: unknown) {
        lastError = this.toError(error);
        this.logger.warn(
          `Webhook call attempt ${attempt + 1} failed: ${lastError.message}`,
        );

        if (attempt < webhook.maxRetries - 1) {
          await this.webhookCallService.incrementRetry(call.id);
          const backoffMs = Math.pow(2, attempt) * 1000;
          await this.sleep(backoffMs);
        }
      }
    }

    // All retries failed
    throw (
      lastError || new Error('Webhook call failed after all retry attempts')
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private toError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    return new Error(String(error));
  }

  private getErrorMessage(error: unknown): string {
    return this.toError(error).message;
  }
}
