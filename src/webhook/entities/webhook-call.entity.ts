import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Webhook } from './webhook.entity';

export enum WebhookCallStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  RETRY = 'RETRY',
}

@Entity()
export class WebhookCall {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  webhookId: number;

  @ManyToOne(() => Webhook, (webhook) => webhook.calls, { onDelete: 'CASCADE' })
  webhook: Webhook;

  @Column()
  eventType: string;

  @Column({ type: 'simple-json' })
  payload: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: WebhookCallStatus,
    default: WebhookCallStatus.PENDING,
  })
  status: WebhookCallStatus;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ type: 'text', nullable: true })
  response: string;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ nullable: true })
  lastAttemptAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
