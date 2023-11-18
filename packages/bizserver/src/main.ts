import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as cookieParser from 'cookie-parser';
import { types as pg_types } from 'pg';

import env from './envs';

import { AppModule } from './modules/app.module';
import { redisClient } from './redis';
import { minioClient, setup_minio } from './minio';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { UserEntity } from 'src/entity/user';
import { ProblemEntity } from 'src/entity/problem';
import { ContestEntity } from 'src/entity/contest';
import { SubmissionEntity } from './entity/submission';

async function bootstrap() {
  const AppDataSource: DataSource = new DataSource({
    type: 'postgres',
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    username: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    synchronize: env.POSTGRES_SYNCHRONIZE,
    entities: [UserEntity, ProblemEntity, ContestEntity, SubmissionEntity]
  })
  // PostgreSQL bigint is 64-bit signed integer, which is not enough for JavaScript's Number
  // so it returns a string instead. We need to convert it to number.
  // https://github.com/typeorm/typeorm/issues/8583
  pg_types.setTypeParser(pg_types.builtins.INT8, function(val) {
    return Number(val)
  });

  await AppDataSource.initialize()
  console.log("Data Source has been initialized!")
  await redisClient.connect();
  console.log("Redis Client has been connected!")
  await setup_minio();
  console.log("Minio has been initialized!")

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
