import { Module } from '@nestjs/common';

import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { ProblemController } from './problem/problem.controller';
import { ProblemService } from './problem/problem.service';
import { ContestController } from './contest/contest.controller';
import { ContestService } from './contest/contest.service';
import { SubmissionController } from './submission/submission.controller';
import { SubmissionService } from './submission/submission.service';
import { RolesGuard } from './user/authorization.service';

@Module({
  imports: [],
  controllers: [UserController, ProblemController, ContestController, SubmissionController],
  providers: [UserService, ProblemService, ContestService, SubmissionService, {
    provide: 'APP_GUARD',
    useClass: RolesGuard,
  }],
})
export class AppModule {
}
