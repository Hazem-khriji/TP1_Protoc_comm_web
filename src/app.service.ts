import { Injectable, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { CvModule } from './cv/cv.module';
import { Cv } from './cv/entities/cv.entity';
import { SeedService } from './seeder';
import { Skill } from './skill/entities/skill.entity';
import { SkillModule } from './skill/skill.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'cv_manager',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Cv, Skill]),

    CvModule,
    UserModule,
    SkillModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
