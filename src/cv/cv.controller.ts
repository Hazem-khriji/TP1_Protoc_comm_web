import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  create(
    @Body() createCvDto: CreateCvDto,
    @CurrentUser() currentUser: { userId: number; role: string },
  ) {
    return this.cvService.create(createCvDto, currentUser.userId);
  }

  @Get()
  findAll(@CurrentUser() currentUser: { userId: number; role: string }) {
    return this.cvService.findAll(currentUser.role, currentUser.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: { userId: number; role: string },
  ) {
    return this.cvService.findOne(+id, currentUser.userId, currentUser.role);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCvDto: UpdateCvDto,
    @CurrentUser() currentUser: { userId: number; role: string },
  ) {
    return this.cvService.update(
      +id,
      updateCvDto,
      currentUser.userId,
      currentUser.role,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: { userId: number; role: string },
  ) {
    return this.cvService.remove(+id, currentUser.userId, currentUser.role);
  }
}
