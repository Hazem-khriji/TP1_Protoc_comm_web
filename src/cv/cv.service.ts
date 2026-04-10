import { Injectable } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

@Injectable()
export class CvService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createCvDto: CreateCvDto) {
    return 'This action adds a new cv';
  }

  findAll() {
    return `This action returns all cv`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cv`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateCvDto: UpdateCvDto) {
    return `This action updates a #${id} cv`;
  }

  remove(id: number) {
    return `This action removes a #${id} cv`;
  }
}
