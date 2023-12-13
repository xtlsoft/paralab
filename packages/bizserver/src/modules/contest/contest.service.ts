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

  // calculateContestRanklist: calculate the ranklist of a contest
  // Input:
  //   problems: a list of problems in this contest
  //   submissions: a list of submissions in this contest
  //   username_map: a map from user_id to username
  // Output:
  //   a Ranklist object
  calculateContestRanklist(
    problems: ProblemEntity[],
    submissions: SubmissionEntity[],
    username_map: { [key: number]: string }
  ): Ranklist {
    // Step 1. Iterate over all submissions and get the best score for every user x every problem
    // For every user x problem, we find the submission with the highest score,
    // and if there are multiple submissions with the same score, we choose the
    // one with the earliest submitTime
    let user_score_map = {};  // user_id => {problem_id => {"score": best_score, "submitTime": submitTime}}
    for (const submission of submissions) {
      const problemId = submission.problem.id;
      const playerId = submission.user.id;
      const score = submission.score;
      const submitTime = submission.submitTime;
      if (!user_score_map[playerId]) {
        user_score_map[playerId] = {};
      }
      if (!user_score_map[playerId][problemId] ||
          user_score_map[playerId][problemId].score < score || 
          (user_score_map[playerId][problemId].score == score && user_score_map[playerId][problemId].submitTime > submitTime)) {
        user_score_map[playerId][problemId] = {
          score: score,
          submitTime: submitTime
        };
      }
    }

    // Step 2. Iterate over all users and calculate their total score
    let players: Ranklist['players'] = [];
    for (const playerId_ in user_score_map) {
      const playerId = parseInt(playerId_);
      let player = {
        userId: playerId,
        username: username_map[playerId],
        score: 0,
        details: []
      };
      for (const problemEntity of problems) {
        if (!problemEntity) {
          // This problem is not found
          player.details.push({
            score: undefined,
            submitTime: undefined
          });
        } else {
          const problemId = problemEntity.id;
          if (user_score_map[playerId][problemId] != undefined) {
            player.score += user_score_map[playerId][problemId].score;
            player.details.push(user_score_map[playerId][problemId]);
          } else {
            // This user has never submitted this problem
            player.details.push({
              score: undefined,
              submitTime: undefined
            });
          }
        }
      }
      players.push(player);
    }

    // Step 3. Sort players by score. If the scores are equal, sort by the last submitTime
    players.sort((a, b) => {
      if (a.score != b.score) {
        return b.score - a.score;
      } else {
        // If the scores are equal, sort by submitTime
        let a_submitTime = 0;
        let b_submitTime = 0;
        for (let i = 0; i < a.details.length; i++) {
          if (a.details[i]) {
            a_submitTime = Math.max(a_submitTime, a.details[i].submitTime);
            break;
          }
        }
        for (let i = 0; i < b.details.length; i++) {
          if (b.details[i]) {
            b_submitTime = Math.max(b_submitTime, b.details[i].submitTime);
            break;
          }
        }
        return a_submitTime - b_submitTime;
      }
    });

    const result: Ranklist = {
      players: players
    };
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
    // Get all usernames
    let username_map = {};  // user_id => username
    for (const submission of submissions) {
      const userId = submission.user.id;
      if (!username_map[userId]) {
        username_map[userId] = await UserEntity.findOneBy({ id: userId }).then(user => user.name);
      }
    }
    
    return this.calculateContestRanklist(problems, submissions, username_map);
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
