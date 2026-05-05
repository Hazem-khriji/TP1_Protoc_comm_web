import { Controller, Get, Sse } from '@nestjs/common';
import { CvEventService } from './cv-event.service';
import { CvEventStreamService } from './cv-event.stream.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('cv-events')
export class CvEventController {
  constructor(
    private readonly cvEventService: CvEventService,
    private readonly cvEventStreamService: CvEventStreamService,
  ) {}

  @Get()
  findAll(@CurrentUser() currentUser: { userId: number; role: string }) {
    return this.cvEventService.findAllForUser(
      currentUser.role,
      currentUser.userId,
    );
  }

  @Sse('stream')
  stream(@CurrentUser() currentUser: { userId: number; role: string }) {
    return this.cvEventStreamService.streamForUser(
      currentUser.role,
      currentUser.userId,
    );
  }
}
