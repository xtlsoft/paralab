import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import env from './envs';

import { User } from 'src/proto/user';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const AppDataSource: DataSource = new DataSource({
    type: 'postgres',
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    username: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    synchronize: env.POSTGRES_SYNCHRONIZE,
    entities: [User]
  })
  await AppDataSource.initialize()
  console.log("Data Source has been initialized!")

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(env.LISTEN_PORT, env.LISTEN_HOST);
}
bootstrap();
