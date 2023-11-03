import { Controller, Get, Post, Put, Delete, Param, Body, Res, Req, ParseIntPipe } from '@nestjs/common';
import { IsEmail, Length, IsNotEmpty, MinLength } from 'class-validator';
import { Request, Response } from 'express';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';

import { ProblemService } from './problem.service';
import { Problem } from '@paralab/proto';
import { JudgeConfig, default_judge_config } from '@paralab/proto';
import env from "src/envs";

class ProblemMetadataDTO {
  @ApiProperty()
  description: string

  @ApiProperty()
  judgeConfig: JudgeConfig
}
class ModifyProblemDTO {
  @Length(1, 100)
  @ApiProperty()
  problemName: string

  @ApiProperty()
  isPublic: boolean

  @ApiProperty()
  allowSubmitFromProblemList: boolean

  @ApiProperty()
  metadata: ProblemMetadataDTO
}

@Controller('/api/user')
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  // POST /problem: Create a new problem
  // It accepts no arguments, creates a new problem with default values (empty
  // description, etc.), and returns the new problem object.
  // Only users marked with is_admin can call this API.
  @Post('/problem')
  @ApiOperation({ summary: 'Create a new problem' })
  async createProblem(): Promise<Problem> {
    return await this.problemService.createProblem();
  }

  // PUT /problem: Modify a problem
  // It accepts a problem object, and returns the modified problem object.
  // Only users marked with is_admin can call this API.
  @Put('/problem/:id')
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
  @Delete('/problem/:id')
  async deleteProblem(@Param('id', new ParseIntPipe()) id: number): Promise<void> {
    await this.problemService.deleteProblem(id);
  }

  // GET /problem/:id: Get problem by id
  @Get(':id')
  async getProblemById(@Param('id', new ParseIntPipe()) id: number): Promise<Problem> {
    return await this.problemService.getProblemById(id);
  }
}
