import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { WebhookCall } from './webhook-call.entity';

export enum WebhookEventType {
  CV_CREATED = 'CV_CREATED',
  CV_UPDATED = 'CV_UPDATED',
  CV_DELETED = 'CV_DELETED',
}

export enum WebhookType {
  HR_ATS = 'HR_ATS',
  ANALYTICS = 'ANALYTICS',
  NOTIFICATION = 'NOTIFICATION',
}

export enum WebhookStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FAILED = 'FAILED',
}

@Entity()
export class Webhook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: WebhookType,
    default: WebhookType.HR_ATS,
  })
  type: WebhookType;

  @Column('simple-array')
  eventTypes: WebhookEventType[];

  @Column({
    type: 'enum',
    enum: WebhookStatus,
    default: WebhookStatus.ACTIVE,
  })
  status: WebhookStatus;

  @Column({ default: 3 })
  maxRetries: number;

  @Column({ default: 5000 })
  timeoutMs: number;

  @Column('simple-json', { nullable: true })
  headers: Record<string, string>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  verifySSL: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => WebhookCall, (call) => call.webhook, { cascade: true })
  calls: WebhookCall[];
}
