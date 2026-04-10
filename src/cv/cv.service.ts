import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Cv } from './entities/cv.entity';
import { User } from '../user/entities/user.entity';
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

  async create(createCvDto: CreateCvDto): Promise<Cv> {
    const user = await this.userRepository.findOneBy({
      id: createCvDto.userId,
    });
    if (!user) {
      throw new NotFoundException(
        `User with id ${createCvDto.userId} not found`,
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
      user,
      skills,
    });

    return this.cvRepository.save(cv);
  }

  findAll(): Promise<Cv[]> {
    return this.cvRepository.find({
      relations: {
        user: true,
        skills: true,
      },
    });
  }

  async findOne(id: number): Promise<Cv> {
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

    return cv;
  }

  async update(id: number, updateCvDto: UpdateCvDto): Promise<Cv> {
    const cv = await this.findOne(id);
    const { userId, skillIds, ...cvFields } = updateCvDto;

    if (userId !== undefined) {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }
      cv.user = user;
    }

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

  async remove(id: number): Promise<Cv> {
    const cv = await this.findOne(id);
    await this.cvRepository.remove(cv);
    return cv;
  }
}
