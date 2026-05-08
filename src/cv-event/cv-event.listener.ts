import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { CvEventPayload } from './cv-event.service';
import { CvEventService } from './cv-event.service';
import { CvEventStreamService } from './cv-event.stream.service';

@Injectable()
export class CvEventListener {
  constructor(
    private readonly cvEventService: CvEventService,
    private readonly cvEventStreamService: CvEventStreamService,
  ) {}

  @OnEvent('cv.persisted')
  async handleCvEvent(payload: CvEventPayload) {
    const savedEvent = await this.cvEventService.create(payload);
    this.cvEventStreamService.push(savedEvent);
  }
}
