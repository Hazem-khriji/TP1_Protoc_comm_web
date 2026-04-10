import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { Skill } from 'src/skill/entities/skill.entity';
import { User } from 'src/user/entities/user.entity';
import { Cv } from './entities/cv.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cv, Skill, User])],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}
