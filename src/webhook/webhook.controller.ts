import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { WebhookService } from './services/webhook.service';
import { WebhookCallService } from './services/webhook-call.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('webhooks')
@UseGuards(AdminGuard)
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly webhookCallService: WebhookCallService,
  ) {}

  @Post()
  create(@Body() createWebhookDto: CreateWebhookDto) {
    return this.webhookService.create(createWebhookDto);
  }

  @Get()
  findAll() {
    return this.webhookService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.webhookService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWebhookDto: UpdateWebhookDto) {
    return this.webhookService.update(+id, updateWebhookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.webhookService.remove(+id);
  }

  @Get(':id/calls')
  getWebhookCalls(@Param('id') id: string) {
    return this.webhookCallService.findByWebhookId(+id, 50);
  }

  @Get(':id/calls/:callId')
  async getWebhookCall(
    @Param('id') webhookId: string,
    @Param('callId') callId: string,
  ) {
    const call = await this.webhookCallService.findByWebhookId(+webhookId);
    const found = call.find((c) => c.id === +callId);

    if (!found) {
      throw new NotFoundException(`Webhook call with id ${callId} not found`);
    }

    return found;
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.webhookService.updateStatus(+id, status);
  }
}
