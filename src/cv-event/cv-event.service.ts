import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvEvent, CvEventType } from './entities/cv-event.entity';
import { UserRole } from '../user/entities/user.entity';

export type CvEventPayload = {
  type: CvEventType;
  cvId: number;
  cvOwnerId: number;
  performedById: number;
  cvSnapshot: Record<string, unknown>;
};

@Injectable()
export class CvEventService {
  constructor(
    @InjectRepository(CvEvent)
    private readonly cvEventRepository: Repository<CvEvent>,
  ) {}

  create(payload: CvEventPayload): Promise<CvEvent> {
    const event = this.cvEventRepository.create(payload);
    return this.cvEventRepository.save(event);
  }

  findAllForUser(role: string | undefined, userId: number): Promise<CvEvent[]> {
    if (this.isAdmin(role)) {
      return this.cvEventRepository.find({
        order: { createdAt: 'DESC' },
      });
    }

    return this.cvEventRepository.find({
      where: { cvOwnerId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  private isAdmin(role: string | undefined): boolean {
    return String(role ?? '').toUpperCase() === UserRole.ADMIN;
  }
}
