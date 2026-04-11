import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Cv } from './entities/cv.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { Skill } from '../skill/entities/skill.entity';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async create(createCvDto: CreateCvDto, userId: number): Promise<Cv> {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    if (!user) {
      throw new NotFoundException(
        `User with id ${userId} not found`,
      );
    }

    let skills: Skill[] = [];
    if (createCvDto.skillIds?.length) {
      const requestedIds = [...new Set(createCvDto.skillIds)];
      skills = await this.skillRepository.findBy({ id: In(requestedIds) });

      if (skills.length !== requestedIds.length) {
        throw new NotFoundException('One or more skills were not found');
      }
    }

    const cv = this.cvRepository.create({
      name: createCvDto.name,
      firstName: createCvDto.firstName,
      age: createCvDto.age,
      cin: createCvDto.cin,
      job: createCvDto.job,
      path: createCvDto.path,
      user,
      skills,
    });

    return this.cvRepository.save(cv);
  }

  findAll(userRole?: string, userId?: number): Promise<Cv[]> {
    if (userRole === UserRole.ADMIN) {
      return this.cvRepository.find({
        relations: {
          user: true,
          skills: true,
        },
      });
    }

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    return this.cvRepository.find({
      where: { user: { id: userId } },
      relations: {
        user: true,
        skills: true,
      },
    });
  }

  async findOne(id: number, userId: number, userRole?: string): Promise<Cv> {
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: {
        user: true,
        skills: true,
      },
    });

    if (!cv) {
      throw new NotFoundException(`Cv with id ${id} not found`);
    }

    if (userRole !== UserRole.ADMIN && cv.user.id !== userId) {
      throw new ForbiddenException('You can only access your own CVs');
    }

    return cv;
  }

  async update(id: number, updateCvDto: UpdateCvDto, userId: number, userRole?: string): Promise<Cv> {
    const cv = await this.findOne(id, userId, userRole);

    const { skillIds, ...cvFields } = updateCvDto;

    if (skillIds !== undefined) {
      const requestedIds = [...new Set(skillIds)];
      const skills = requestedIds.length
        ? await this.skillRepository.findBy({ id: In(requestedIds) })
        : [];

      if (skills.length !== requestedIds.length) {
        throw new NotFoundException('One or more skills were not found');
      }

      cv.skills = skills;
    }

    Object.assign(cv, cvFields);
    return this.cvRepository.save(cv);
  }

  async remove(id: number, userId: number, userRole?: string): Promise<Cv> {
    const cv = await this.findOne(id, userId, userRole);

    await this.cvRepository.remove(cv);
    return cv;
  }
}
