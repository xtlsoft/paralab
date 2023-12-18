import { Controller, Get, Post, Put, Delete, Param, Body, Res, Req, ParseIntPipe, Query, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UploadedFile } from '@nestjs/common';
import { Length, IsNotEmpty, MinLength, IsBoolean, IsString, IsNumber } from 'class-validator';
import { Request, Response } from 'express';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { ProblemService } from './problem.service';
import { ContestService } from '../contest/contest.service';
import { Contest, Problem, Submission } from '@paralab/proto';
import { JudgeConfig, default_judge_config } from '@paralab/proto';
import { Roles } from './../user/authorization.service';
import { ROLE_USER, ROLE_PROBLEMSET_ADMIN, ROLE_CONTEST_ADMIN, ProblemListItem } from '@paralab/proto';
import { AccessToken } from '../user/user.service';
import env from "src/envs";

class ProblemMetadataDTO {
  @IsString()
  @ApiProperty()
  description: string

  @ApiProperty()
  judgeConfig: JudgeConfig
}

class ModifyProblemDTO {
  @Length(1, 100)
  @IsString()
  @ApiProperty()
  problemName: string

  @IsBoolean()
  @ApiProperty()
  isPublic: boolean

  @IsBoolean()
  @ApiProperty()
  allowSubmitFromProblemList: boolean

  @ApiProperty()
  metadata: ProblemMetadataDTO
}


@Controller('/api/problem')
export class ProblemController {
  constructor(private readonly problemService: ProblemService,
              private readonly contestService: ContestService) {}

  // GET /problemlist: Get problem list
  // It accepts two arguments: startIndex and count, and return a list of
  // problems that the current user has access to. The startIndex argument is
  // zero-based, and the count argument is the number of problems to return.
  // The backend will automatically filter out problems that the current user
  // does not have access to.
  @Get('/problemlist')
  @ApiOperation({ summary: 'Get problem list' })
  @Roles([])
  async getProblemList(
    @Req() request: Request,
    @Query("startIndex", new ParseIntPipe()) startIndex: number,
    @Query("count", new ParseIntPipe()) count: number
  ): Promise<{problems: ProblemListItem[], total_visible_problem_count: number}> {
    const user_roles = request['user_info'] ? (request['user_info'] as AccessToken).userRoles : 0;
    const result = await this.problemService.getProblemList(startIndex, count, user_roles);
    return result;
  }

  // POST /problem: Create a new problem
  // It accepts no arguments, creates a new problem with default values (empty
  // description, etc.), and returns the new problem object.
  // Only users marked with ROLE_PROBLEMSET_ADMIN can call this API.
  @Post('/')
  @ApiOperation({ summary: 'Create a new problem' })
  @Roles([ROLE_PROBLEMSET_ADMIN])
  async createProblem(): Promise<Problem> {
    return await this.problemService.createProblem();
  }

  // PUT /problem: Modify a problem
  // It accepts a problem object, and returns the modified problem object.
  // Only users marked with is_admin can call this API.
  @Put('/:id')
  @Roles([ROLE_PROBLEMSET_ADMIN])
  async modifyProblem(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() problem: ModifyProblemDTO
  ): Promise<Problem> {
    return await this.problemService.modifyProblem({
      id: id,
      name: problem.problemName,
      ...problem,
    });
  }

  // POST /problem/:id: Modify a problem's files
  // Here "files" is basically a .zip file, containing
  // - The config (.yaml) file
  // - The problem's assert files (i.e. files that is publicly available to the user)
  // - Files that define how to judge submissions
  @Post('/:id')
  @UseInterceptors(FileInterceptor('file'))
  @Roles([ROLE_PROBLEMSET_ADMIN])
  async modifyProblemFiles(
    @Req() request: Request,
    @Param('id', new ParseIntPipe()) problemId: number,
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: env.MAX_PROBLEM_FILE_SIZE_BYTE }),
        new FileTypeValidator({ fileType: 'application/zip' }),
      ]
    })) file: Express.Multer.File
  ): Promise<{}> {
    const problem: Problem = await this.problemService.getProblemById(problemId);
    if (!problem) {
      throw new BadRequestException('invalid problem id');
    }

    await this.problemService.modifyProblemFiles(problemId, file);

    return {};
  }

  // DELETE /problem/:id: Delete a problem
  // It accepts a problem id, and returns nothing.
  // Only users marked with is_admin can call this API.
  @Delete('/:id')
  @Roles([ROLE_PROBLEMSET_ADMIN])
  async deleteProblem(@Param('id', new ParseIntPipe()) id: number): Promise<{}> {
    await this.problemService.deleteProblem(id);
    return {};
  }

  // GET /problem/:id: Get problem by id
  @Get(':id')
  @Roles([])
  async getProblemById(
    @Req() request: Request,
    @Param('id', new ParseIntPipe()) id: number
  ): Promise<Problem> {
    const problem = await this.problemService.getProblemById(id);
    const user_roles = request['user_info'] ? (request['user_info'] as AccessToken).userRoles : 0;
    if (!problem.isPublic && !(user_roles & ROLE_PROBLEMSET_ADMIN)) {
      throw new UnauthorizedException('the problem is not public');
    }
    return problem;
  }
}
