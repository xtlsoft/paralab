import { Controller, Get, Post, Put, Delete, Param, Body, Res, Req, ParseIntPipe, Query, UnauthorizedException } from '@nestjs/common';
import { IsEmail, Length, IsNotEmpty, MinLength, IsBoolean, IsString, IsNumber, IsDate } from 'class-validator';
import { Request, Response } from 'express';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';

import { ContestService } from './contest.service';
import { ProblemService } from '../problem/problem.service';
import { Contest } from '@paralab/proto';
import { Roles } from './../user/authorization.service';
import { ROLE_USER, ROLE_CONTEST_ADMIN, ContestListItem, ContestWithProblemName } from '@paralab/proto';
import { AccessToken } from '../user/user.service';
import env from "src/envs";

class ProblemInContestMetadataDTO {
  @IsNumber()
  @ApiProperty()
  id: number

  @IsNumber()
  @ApiProperty()
  weight: number
}

class ContestMetadataDTO {
  @IsNumber()
  @ApiProperty()
  description: string

  @ApiProperty()
  problems: ProblemInContestMetadataDTO[]
}

class ModifyContestDTO {
  @Length(1, 100)
  @IsString()
  @ApiProperty()
  name: string

  @IsNumber()
  @ApiProperty()
  startTime: number	// In UNIX timestamp, milliseconds

  @IsNumber()
  @ApiProperty()
  endTime: number	// In UNIX timestamp, milliseconds

  @IsBoolean()
  @ApiProperty()
  isPublic: boolean

  @ApiProperty()
  metadata: ContestMetadataDTO
}

@Controller('/api/contest')
export class ContestController {
  constructor(private readonly contestService: ContestService,
      private readonly problemService: ProblemService) {}

  // GET /contestlist: Get contest list
  // It accepts two arguments: startIndex and count, and return a list of
  // contests that the current user has access to. The startIndex argument is
  // zero-based, and the count argument is the number of contests to return.
  // The backend will automatically filter out contests that the current user
  // does not have access to.
  @Get('/contestlist')
  @ApiOperation({ summary: 'Get contest list' })
  @Roles([])
  async getContestList(
    @Req() request: Request,
    @Query("startIndex", new ParseIntPipe()) startIndex: number,
    @Query("count", new ParseIntPipe()) count: number
  ): Promise<{contests: ContestListItem[], total_visible_contest_count: number}> {
    const user_roles = request['user_info'] ? (request['user_info'] as AccessToken).userRoles : 0;
    const result = await this.contestService.getContestList(startIndex, count, user_roles);
    return result;
  }

  // POST /contest: Create a new contest
  // It accepts no arguments, creates a new contest with default values (empty
  // description, etc.), and returns the new contest object.
  // Only users marked with ROLE_CONTEST_ADMIN can call this API.
  @Post('/')
  @ApiOperation({ summary: 'Create a new contest' })
  @Roles([ROLE_CONTEST_ADMIN])
  async createContest(): Promise<Contest> {
    return await this.contestService.createContest();
  }

  // GET /contest/:id: Get contest by id
  @Get(':id')
  @Roles([])
  async getContestById(
    @Req() request: Request,
    @Param('id', new ParseIntPipe()) id: number
  ): Promise<ContestWithProblemName> {
    const contest = await this.contestService.getContestById(id);
    const user_roles = request['user_info'] ? (request['user_info'] as AccessToken).userRoles : 0;
    if (!contest.isPublic && !(user_roles & ROLE_CONTEST_ADMIN)) {
      throw new UnauthorizedException('the contest is not public');
    }
    const result: ContestWithProblemName = {
      ...contest,
      metadata: {
        ...contest.metadata,
        problems: await Promise.all(
          contest.metadata.problems.map(async (problem) => {
            let name: string = ""
            try {
              name = (await this.problemService.getProblemById(problem.id)).name
            } catch (e) {
              name = "(Not Found)"
            }
            return {
              ...problem,
              name: name
            }
          })
        )
      }
    };
    return result;
  }

  // PUT /contest: Modify a contest
  // It accepts a contest object, and returns the modified contest object.
  // Only users marked with is_admin can call this API.
  @Put('/:id')
  @Roles([ROLE_CONTEST_ADMIN])
  async modifyContest(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() contest: ModifyContestDTO
  ): Promise<Contest> {
    return await this.contestService.modifyContest({
      id: id,
      ...contest,
    });
  }

  // DELETE /contest/:id: Delete a contest
  // It accepts a contest id, and returns nothing.
  // Only users marked with is_admin can call this API.
  @Delete('/:id')
  @Roles([ROLE_CONTEST_ADMIN])
  async deleteContest(@Param('id', new ParseIntPipe()) id: number): Promise<{}> {
    await this.contestService.deleteContest(id);
    return {};
  }
}
