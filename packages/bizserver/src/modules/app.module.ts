import { Module } from '@nestjs/common';

import { AppController } from './main/main.controller';
import { AppService } from './main/main.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
  imports: [],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {
}
