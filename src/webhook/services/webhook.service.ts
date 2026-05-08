import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Webhook,
  WebhookEventType,
  WebhookStatus,
} from '../entities/webhook.entity';
import { CreateWebhookDto } from '../dto/create-webhook.dto';
import { UpdateWebhookDto } from '../dto/update-webhook.dto';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>,
  ) {}

  async create(createWebhookDto: CreateWebhookDto): Promise<Webhook> {
    const webhook = this.webhookRepository.create(createWebhookDto);
    return this.webhookRepository.save(webhook);
  }

  async findAll(): Promise<Webhook[]> {
    return this.webhookRepository.find({
      relations: ['calls'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Webhook> {
    const webhook = await this.webhookRepository.findOne({
      where: { id },
      relations: ['calls'],
    });

    if (!webhook) {
      throw new NotFoundException(`Webhook with id ${id} not found`);
    }

    return webhook;
  }

  async findByEventType(eventType: WebhookEventType): Promise<Webhook[]> {
    return this.webhookRepository
      .find({
        where: {
          status: WebhookStatus.ACTIVE,
        },
      })
      .then((webhooks) =>
        webhooks.filter((w) => w.eventTypes.includes(eventType)),
      );
  }

  async update(
    id: number,
    updateWebhookDto: UpdateWebhookDto,
  ): Promise<Webhook> {
    const webhook = await this.findOne(id);
    Object.assign(webhook, updateWebhookDto);
    return this.webhookRepository.save(webhook);
  }

  async remove(id: number): Promise<void> {
    const webhook = await this.findOne(id);
    await this.webhookRepository.remove(webhook);
  }

  async updateStatus(id: number, status: string): Promise<Webhook> {
    const webhook = await this.findOne(id);
    webhook.status = this.parseStatus(status);
    return this.webhookRepository.save(webhook);
  }

  private parseStatus(status: string): WebhookStatus {
    const normalizedStatus = status.toUpperCase() as WebhookStatus;

    if (Object.values(WebhookStatus).includes(normalizedStatus)) {
      return normalizedStatus;
    }

    throw new NotFoundException(`Invalid webhook status: ${status}`);
  }
}
