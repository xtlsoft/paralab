import { Injectable, Req, Res } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

import env from "src/envs";

import { Contest, Ranklist, RoleMask, ContestListItem, ROLE_CONTEST_ADMIN } from '@paralab/proto'
import { JudgeConfig, default_judge_config } from '@paralab/proto';
import { ContestEntity } from 'src/entity/contest';
import { ProblemEntity } from 'src/entity/problem';
import { SubmissionEntity } from 'src/entity/submission';
import { UserEntity } from 'src/entity/user';

const MAX_CONTEST_DESCRIPTION_LENGTH: number = 256*1024; // 256 KB

@Injectable()
export class ContestService {
  async getContestList(startIndex: number, count: number, userRoles: RoleMask): Promise<{contests: ContestListItem[], total_visible_contest_count: number}> {
    if (count > 100) {
      throw new BadRequestException('count is too large');
    }
    const filter = {};
    // CONTEST_ADMINs can see all contests regardless of their visibility
    // while normal users can only see public contests
    if (!(userRoles & ROLE_CONTEST_ADMIN)) {
      filter['isPublic'] = true;
    }
    const result = await ContestEntity.find({
      select: ['id', 'name', 'startTime', 'endTime', 'isPublic'],
      where: filter,
      skip: startIndex,
      take: count,
      order: {
        id: 'ASC'
      }
    });
    const total_visible_contest_count = await ContestEntity.countBy(filter);
    return {
      contests: result,
      total_visible_contest_count
    };
  }

  async createContest(): Promise<Contest> {
    const contest = new ContestEntity();
    contest.name = 'New Contest';
    contest.startTime = 4e12; // in 2096
    contest.endTime = 6e12;
    contest.metadata = {
      description: '',
      problems: []
    };
    contest.isPublic = false;
    await contest.save();
    return contest;
  }

  async getContestById(id: number): Promise<Contest> {
    const result = await ContestEntity.findOneBy({ id: id });
    if (!result) {
      throw new BadRequestException('contest not found');
    }
    return result;
  }

  async getContestRanklist(id: number): Promise<Ranklist> {
    const contest = await this.getContestById(id);
    // Get all problems in this context
    const problems: ProblemEntity[] = await Promise.all(
      contest.metadata.problems.map(problem => ProblemEntity.findOneBy({ id: problem.id }))
    );
    // Get all submissions in this contest
    const submissions = await SubmissionEntity.find({
      where: {
        contest: contest
      },
      relations: ['user', 'problem']
    });
    // Iterate over all submissions and get the best score for every user x every problem
    let user_score_map = {};  // user_id => {problem_id => best_score}
    for (const submission of submissions) {
      const problemId = submission.problem.id;
      const playerId = submission.user.id;
      const score = submission.score;
      if (!user_score_map[playerId]) {
        user_score_map[playerId] = {};
      }
      if (!user_score_map[playerId][problemId]) {
        user_score_map[playerId][problemId] = 0;
      }
      user_score_map[playerId][problemId] = Math.max(
        user_score_map[playerId][problemId],
        score
      );
    }
    let players: Ranklist['players'] = [];
    for (const playerId_ in user_score_map) {
      const playerId = parseInt(playerId_);
      let player = {
        userId: playerId,
        username: await UserEntity.findOneBy({ id: playerId }).then(user => user.name),
        score: 0,
        details: []
      };
      for (const problemEntity of problems) {
        if (!problemEntity) {
          // This problem is not found
          player.details.push({
            points: undefined
          });
        } else {
        const problemId = problemEntity.id;
          const score = user_score_map[playerId][problemId];
          if (score != undefined)
            player.score += score;
          player.details.push({
            points: score
          });
        }
      }
      players.push(player);
    }

    const result: Ranklist = {
      players: players
    };
    return result;
  }

  async modifyContest(contest: Contest): Promise<Contest> {
    if (contest.startTime > contest.endTime) {
      throw new BadRequestException('startTime should not latter than endTime');
    }
    const result = await ContestEntity.findOneBy({ id: contest.id });
    if (!result) {
      throw new BadRequestException('problem not found');
    }
    if (contest.metadata.description.length > MAX_CONTEST_DESCRIPTION_LENGTH) {
      throw new BadRequestException('description too long');
    }
    result.name = contest.name;
    result.startTime = contest.startTime;
    result.endTime = contest.endTime;
    result.isPublic = contest.isPublic;
    result.metadata = contest.metadata;
    await result.save();
    return result;
  }

  async deleteContest(id: number): Promise<void> {
    const result = await ContestEntity.findOneBy({ id: id });
    if (!result) {
      throw new BadRequestException('problem not found');
    }
    await result.remove();
  }
}
