import { Controller, Get, Post, Put, Delete, Param, Body, Res, Req, ParseIntPipe, Query, UnauthorizedException } from '@nestjs/common';
import { IsEmail, Length, IsNotEmpty, MinLength, IsBoolean, IsString, IsNumber } from 'class-validator';
import { Request, Response } from 'express';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';

import { ProblemService } from './problem.service';
import { Problem } from '@paralab/proto';
import { JudgeConfig, default_judge_config } from '@paralab/proto';
import { Roles } from './../user/authorization.service';
import { ROLE_USER, ROLE_PROBLEMSET_ADMIN, ProblemListItem } from '@paralab/proto';
import { AccessToken } from '../user/user.service';
import env from "src/envs";

class ProblemMetadataDTO {
  @IsNumber()
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
  constructor(private readonly problemService: ProblemService) {}

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
  // Only users marked with is_admin can call this API.
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
