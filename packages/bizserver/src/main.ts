import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as cookieParser from 'cookie-parser';

import env from './envs';

import { AppModule } from './modules/app.module';
import { redisClient } from './redis';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { UserEntity } from 'src/entity/user';
import { ProblemEntity } from 'src/entity/problem';
import { ContestEntity } from 'src/entity/contest';

async function bootstrap() {
  const AppDataSource: DataSource = new DataSource({
    type: 'postgres',
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    username: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    synchronize: env.POSTGRES_SYNCHRONIZE,
    entities: [UserEntity, ProblemEntity, ContestEntity]
  })
  await AppDataSource.initialize()
  console.log("Data Source has been initialized!")
  await redisClient.connect();
  console.log("Redis Client has been connected!")

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser(env.COOKIE_SECRET));
    
  const swagger_config = new DocumentBuilder()
    .setTitle('Paralab API document')
    .setDescription('The Paralab API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swagger_config);
  SwaggerModule.setup('api', app, document);
  await app.listen(env.LISTEN_PORT, env.LISTEN_HOST);
}
bootstrap();
