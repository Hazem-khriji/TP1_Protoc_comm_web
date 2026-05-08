export class WebhookCallDto {
  id: number;
  webhookId: number;
  eventType: string;
  payload: Record<string, unknown>;
  status: string;
  statusCode: number;
  response: string;
  retryCount: number;
  lastAttemptAt: Date;
  completedAt: Date;
  errorMessage: string;
  createdAt: Date;
}
