import { Module } from '@nestjs/common';

import { AppController } from './main/main.controller';
import { AppService } from './main/main.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { ProblemController } from './problem/problem.controller';
import { ProblemService } from './problem/problem.service';
import { RolesGuard } from './user/authorization.service';

@Module({
  imports: [],
  controllers: [AppController, UserController, ProblemController],
  providers: [AppService, UserService, ProblemService, {
    provide: 'APP_GUARD',
    useClass: RolesGuard,
  }],
})
export class AppModule {
}
