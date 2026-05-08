import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WebhookCall,
  WebhookCallStatus,
} from '../entities/webhook-call.entity';

@Injectable()
export class WebhookCallService {
  constructor(
    @InjectRepository(WebhookCall)
    private readonly webhookCallRepository: Repository<WebhookCall>,
  ) {}

  async create(
    webhookId: number,
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<WebhookCall> {
    const call = this.webhookCallRepository.create({
      webhookId,
      eventType,
      payload,
      status: WebhookCallStatus.PENDING,
    });

    return this.webhookCallRepository.save(call);
  }

  async updateStatus(
    callId: number,
    status: WebhookCallStatus,
    statusCode?: number,
    response?: string,
    errorMessage?: string | null,
  ): Promise<WebhookCall> {
    const call = await this.webhookCallRepository.findOne({
      where: { id: callId },
    });

    if (!call) {
      throw new Error(`WebhookCall with id ${callId} not found`);
    }

    call.status = status;
    if (statusCode !== undefined) call.statusCode = statusCode;
    if (response !== undefined) call.response = response;
    if (errorMessage !== undefined) call.errorMessage = errorMessage;
    call.completedAt = status === WebhookCallStatus.SUCCESS ? new Date() : null;
    call.lastAttemptAt = new Date();

    return this.webhookCallRepository.save(call);
  }

  async incrementRetry(callId: number): Promise<WebhookCall> {
    const call = await this.webhookCallRepository.findOne({
      where: { id: callId },
    });

    if (!call) {
      throw new Error(`WebhookCall with id ${callId} not found`);
    }

    call.retryCount += 1;
    call.status = WebhookCallStatus.RETRY;
    call.lastAttemptAt = new Date();

    return this.webhookCallRepository.save(call);
  }

  async findByWebhookId(webhookId: number, limit = 20): Promise<WebhookCall[]> {
    return this.webhookCallRepository.find({
      where: { webhookId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findFailedCalls(limit = 100): Promise<WebhookCall[]> {
    return this.webhookCallRepository.find({
      where: { status: WebhookCallStatus.FAILED },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
