import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import 'reflect-metadata';
import {
  randFullName,
  randEmail,
  randJobTitle,
  randSkill,
  randNumber,
} from '@ngneat/falso';
import { User } from './user/entities/user.entity';
import { Cv } from './cv/entities/cv.entity';
import { Skill } from './skill/entities/skill.entity';
import { UserRole } from './user/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Cv) private cvRepo: Repository<Cv>,
    @InjectRepository(Skill) private skillRepo: Repository<Skill>,
  ) {}

  async seed() {
    const saltOrRounds = 10;
    // li sar 9ball nfass5ooh
    await this.cvRepo.manager.query('DELETE FROM `skill_cvs_cv`');
    await this.cvRepo.createQueryBuilder().delete().from(Cv).execute();
    await this.skillRepo.createQueryBuilder().delete().from(Skill).execute();
    await this.userRepo.createQueryBuilder().delete().from(User).execute();

    // Skills (aandna 10 skills)
    const skills = await this.skillRepo.save(
      Array.from({ length: 10 }, () => ({
        designation: randSkill(),
      })),
    );

    // Users (besh naamloo 5 users)
    for (let i = 0; i < 5; i++) {
      const user = await this.userRepo.save({
        username: randFullName(),
        email: randEmail(),
        password: await bcrypt.hash('al9ooli_stage', saltOrRounds),
        role: UserRole.USER,
      });

      // Cvs
      for (let j = 0; j < randNumber({ min: 1, max: 3 }); j++) {
        const name = randFullName();
        const firstName = name.split(' ')[0];
        const sk: Skill[] = [];
        const used = new Set();
        for (let k = 0; k < 5; k++) {
          const randomIndex = Math.floor(Math.random() * skills.length);
          if (!used.has(randomIndex)) {
            used.add(randomIndex);
            sk.push(skills[randomIndex]);
          }
        }

        await this.cvRepo.save({
          name: name,
          firstName: firstName,
          age: randNumber({ min: 18, max: 62 }),
          cin: randNumber({ min: 10000000, max: 99999999 }).toString(),
          job: randJobTitle(),
          path: 'path/to/cv.pdf',
          user: user,
          skills: sk,
        });
      }
    }
  }
}
