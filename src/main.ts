import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { SeedService } from './seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const seeder = app.get(SeedService);
  try {
    console.log('Seeding bdee w ani ltaw ma l9itsh stage...');
    await seeder.seed();
    console.log('Seeding kmel w ani ltaw ma l9itsh stage');
  } catch (error) {
    console.error('Ani w seeding zooz ma 5dmnesh', error);
  } finally {
    await app.close();
  }
}
void bootstrap();
