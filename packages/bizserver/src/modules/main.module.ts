import { Module } from '@nestjs/common';
import { AppController } from './main/main.controller';
import { AppService } from './main/main.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
