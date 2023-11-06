import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { Length, IsNotEmpty, MinLength, IsBoolean, IsString, IsNumber, IsEnum } from 'class-validator';
import { Controller, Get, Post, Put, Delete, Param, Body, Res, Req, ParseIntPipe, Query, UnauthorizedException, BadRequestException, ParseFilePipe } from '@nestjs/common';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';

import { ROLE_USER, ROLE_PROBLEMSET_ADMIN, ROLE_CONTEST_ADMIN, ProblemListItem, JudgeResult, SubmissionVerdict, submission_verdicts } from '@paralab/proto';
import { Contest, Problem, Submission, Job } from '@paralab/proto';
import env from "src/envs";

import { SubmissionService } from './submission.service'
import { ProblemService } from '../problem/problem.service';
import { ContestService } from '../contest/contest.service';
import { AccessToken } from '../user/user.service';
import { Roles } from './../user/authorization.service';
import { Subscribable } from 'rxjs';

class ModifyJobStatusDTO {
  @IsNumber()
  @ApiProperty()
  id: number

  @IsString()
  @ApiProperty()
  verdict: SubmissionVerdict

  @IsNumber()
  @ApiProperty()
  score: number

  @ApiProperty()
  result: any
}

@Controller('/api/submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService,
              private readonly problemService: ProblemService,
              private readonly contestService: ContestService) {}
    
  // GET /submissionlist: Get the submission list
  // Permission checking logic:
  //  - Contest admin & Problemset admin can view all submissions
  //  - Normal users can see submissions that:
  //    - Submitted by herself
  //    - Submissions from the problemset and the submission belong to a public
  //      problem
  @Get('/submissionlist')
  async getSubmissionList(
    @Req() request: Request,
    @Query("startIndex", new ParseIntPipe()) startIndex: number,
    @Query("count", new ParseIntPipe()) count: number
  ): Promise<{submissions: Submission[], total_visible_submission_count: number}> {
    const userId: number | undefined = request['user_info'] ? (request['user_info'] as AccessToken).userId : undefined;
    const userRoles: number = userId ? request['user_info'].userRoles : 0;
    const result = await this.submissionService.getSubmissionList(startIndex, count, userId, userRoles);
    return result;
  }

  // POST /submission/: Submit a solution to a problem
  @Post('/')
  @UseInterceptors(FileInterceptor('file'))
  @Roles([ROLE_USER])
  async submitSolution(
    @Req() request: Request,
    @Body() payload: {problemId: number | undefined, contestId: number | undefined},
    @UploadedFile(new ParseFilePipe({validators: [new MaxFileSizeValidator({ maxSize: env.MAX_SUBMIT_FILE_SIZE_BYTE })]})) file: Express.Multer.File
  ): Promise<{submissionId: number}> {
    if (!payload.problemId) {
      throw new BadRequestException('invalid problem id');
    }
    const user_info: AccessToken = request['user_info'];
    const contestId: number | undefined = payload.contestId;
    const problemId = payload.problemId;
    const problem: Problem = await this.problemService.getProblemById(problemId);
    if (!contestId) {
      // The user is submitting to a problem
      if (!problem.allowSubmitFromProblemList && !(user_info.userRoles & ROLE_PROBLEMSET_ADMIN)) {
        throw new UnauthorizedException('the problem does not allow submit from the problem list');
      }
    } else {
      // The user is submitting to a contest
      const contest: Contest = await this.contestService.getContestById(contestId);
      if (!contest.isPublic && !(user_info.userRoles & ROLE_CONTEST_ADMIN)) {
        throw new UnauthorizedException('the contest is not public');
      }
      if (contest.startTime > Date.now()) {
        throw new BadRequestException('the contest has not started yet');
      }
      if (contest.endTime < Date.now()) {
        throw new BadRequestException('the contest has ended');
      }
      if (!contest.metadata.problems.map((problem) => problem.id).includes(problemId)) {
        throw new BadRequestException('the contest does not contain the problem');
      }
    }
    const submissionId = await this.submissionService.submitSolutionToDB(problemId, contestId, user_info.userId);
    await this.submissionService.submitSolutionToOSS(submissionId, file);
    return {
      submissionId
    };
  }

  // GET /submission/jobs: Get the submission jobs (called by ParaCI)
  @Get('/jobs')
  @ApiOperation({ summary: 'Get the submission jobs (called by ParaCI)' })
  async getSubmissionJobs(
    @Req() request: Request,
    @Query("limit", new ParseIntPipe()) limit: number,
  ): Promise<Job[]> {
    // TODO Add permission checking here!
    const result: Job[] = await this.submissionService.getJobs(limit);
    return result;
  }
  
  // PUT /submission/jobs: Update job status
  @Put('/jobs')
  @ApiOperation({ summary: 'Update job status' })
  async updateJobStatus(
    @Req() request: Request,
    @Body() payload: ModifyJobStatusDTO
  ): Promise<{}> {
    // TODO Add permission checking here!
    if (!submission_verdicts.includes(payload.verdict)) {
      throw new BadRequestException(`Invalid verdict. Valid verdicts are: [${submission_verdicts.join(', ')}]`);
    }
    await this.submissionService.updateJobStatus(payload.id, payload.verdict, payload.score, payload.result);
    return {};
  }

  // GET /submission/:submissionId: Get submission info
  // Note about permission checking: Submissions from problemset (public problems) are public to
  // everyone while submission from contests are private to the submitter
  @Get('/:id')
  @ApiOperation({ summary: 'Get submission info' })
  async getSubmissionInfo(
    @Req() request: Request,
    @Param('id', new ParseIntPipe()) submissionId: number
  ): Promise<Submission> {
    const userId: number | undefined = request['user_info'] ? (request['user_info'] as AccessToken).userId : undefined;
    const userRoles: number = userId ? request['user_info'].userRoles : 0;
    const submission: Submission = await this.submissionService.getSubmissionById(submissionId);
    const is_in_contest_submission: boolean = submission.contest !== null;

    const have_permission: boolean = await (async () => {
      // Perform permission checking
      // First, PROBLEMSET_ADMIN and CONTEST_ADMIN can see all submissions
      if ((userRoles & ROLE_PROBLEMSET_ADMIN) || (userRoles & ROLE_CONTEST_ADMIN)) {
        return true;
      }
      // Second, the submission's owner can see it
      if (userId === submission.user.id) {
        return true;
      }
      // Third, for submissions from problemset, if the user is not the owner,
      // the problem must be public
      if (!is_in_contest_submission) {
        if (submission.problem.isPublic) {
          return true;
        }
      }
      return false;
    })();

    if (!have_permission) {
      throw new UnauthorizedException('no permission to view the submission');
    }

    return submission;
  }
}