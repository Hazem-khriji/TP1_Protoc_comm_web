import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum CvEventType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity()
export class CvEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: CvEventType,
  })
  type: CvEventType;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  cvId: number;

  @Column()
  cvOwnerId: number;

  @Column()
  performedById: number;

  @Column({ type: 'simple-json' })
  cvSnapshot: Record<string, unknown>;
}
