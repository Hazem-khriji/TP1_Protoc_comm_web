import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CvEvent } from './entities/cv-event.entity';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class CvEventStreamService {
  private readonly eventStream = new Subject<CvEvent>();

  push(event: CvEvent) {
    this.eventStream.next(event);
  }

  streamForUser(
    role: string | undefined,
    userId: number,
  ): Observable<MessageEvent> {
    const isAdmin = this.isAdmin(role);

    return this.eventStream.asObservable().pipe(
      filter((event) => isAdmin || event.cvOwnerId === userId),
      map((event) => ({
        data: event,
        type: event.type,
      })),
    );
  }

  private isAdmin(role: string | undefined): boolean {
    return String(role ?? '').toUpperCase() === String(UserRole.ADMIN);
  }
}
