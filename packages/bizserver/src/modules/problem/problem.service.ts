import { Injectable, Req, Res } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

import env from "src/envs";

import { Problem } from '@paralab/proto'
import { ProblemEntity } from 'src/entity/problem';
import { JudgeConfig, default_judge_config } from '@paralab/proto';

const MAX_PROBLEM_DESCRIPTION_LENGTH: number = 256*1024; // 256 KB

@Injectable()
export class ProblemService {
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
