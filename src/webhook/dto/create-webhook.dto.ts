import {
  IsString,
  IsUrl,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { WebhookEventType, WebhookType } from '../entities/webhook.entity';

export class CreateWebhookDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsEnum(WebhookType)
  type: WebhookType;

  @IsArray()
  @IsEnum(WebhookEventType, { each: true })
  eventTypes: WebhookEventType[];

  @IsOptional()
  @IsNumber()
  maxRetries?: number;

  @IsOptional()
  @IsNumber()
  timeoutMs?: number;

  @IsOptional()
  headers?: Record<string, string>;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  verifySSL?: boolean;
}
