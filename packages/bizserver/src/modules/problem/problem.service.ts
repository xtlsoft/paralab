import { Injectable, Req, Res } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

import env from "src/envs";
import { minioClient, getBucketName } from 'src/minio';

import { Problem, RoleMask, ProblemListItem, ROLE_PROBLEMSET_ADMIN, ContestListItem } from '@paralab/proto'
import { ProblemEntity } from 'src/entity/problem';
import { JudgeConfig, default_judge_config, JudgeResult, default_judge_result } from '@paralab/proto';

const MAX_PROBLEM_DESCRIPTION_LENGTH: number = 256*1024; // 256 KB

@Injectable()
export class ProblemService {
  async getProblemList(startIndex: number, count: number, userRoles: RoleMask): Promise<{problems: ProblemListItem[], total_visible_problem_count: number}> {
    if (count > 100) {
      throw new BadRequestException('count is too large');
    }
    const filter = {};
    // PROBLEMSET_ADMINs can see all problems regardless of their visibility
    // while normal users can only see public problems
    if (!(userRoles & ROLE_PROBLEMSET_ADMIN)) {
      filter['isPublic'] = true;
    }
    const result = await ProblemEntity.find({
      select: ['id', 'name', 'isPublic', 'allowSubmitFromProblemList'],
      where: filter,
      skip: startIndex,
      take: count,
      order: {
        id: 'ASC'
      }
    });
    const total_visible_problem_count = await ProblemEntity.countBy(filter);
    return {
      problems: result,
      total_visible_problem_count: total_visible_problem_count
    };
  }

  async getProblemById(id: number): Promise<Problem> {
    const result = await ProblemEntity.findOneBy({ id: id });
    if (!result) {
      throw new BadRequestException('problem not found');
    }
    return result;
  }

  async createProblem(): Promise<Problem> {
    const problem = new ProblemEntity();
    problem.name = 'New Problem';
    problem.metadata = {
      description: '',
      judgeConfig: default_judge_config
    };
    problem.isPublic = false;
    problem.allowSubmitFromProblemList = false;
    await problem.save();
    return problem;
  }

  async modifyProblem(problem: Problem): Promise<Problem> {
    const result = await ProblemEntity.findOneBy({ id: problem.id });
    if (!result) {
      throw new BadRequestException('problem not found');
    }
    if (problem.metadata.description.length > MAX_PROBLEM_DESCRIPTION_LENGTH) {
      throw new BadRequestException('description too long');
    }
    result.name = problem.name;
    result.metadata = problem.metadata;
    result.isPublic = problem.isPublic;
    result.allowSubmitFromProblemList = problem.allowSubmitFromProblemList;
    await result.save();
    return result;
  }

  async deleteProblem(id: number): Promise<void> {
    const result = await ProblemEntity.findOneBy({ id: id });
    if (!result) {
      throw new BadRequestException('problem not found');
    }
    await result.remove();
  }
}
