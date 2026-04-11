import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(SeedService);

  try {
    console.log('Seeding started...');
    await seeder.seed();
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Seeding failed', error);
  } finally {
    await app.close();
  }
}

void bootstrap();
