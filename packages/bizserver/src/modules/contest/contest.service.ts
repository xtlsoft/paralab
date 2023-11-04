import { Injectable, Req, Res } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

import env from "src/envs";

import { Contest, RoleMask, ContestListItem, ROLE_CONTEST_ADMIN } from '@paralab/proto'
import { ContestEntity } from 'src/entity/contest';
import { JudgeConfig, default_judge_config } from '@paralab/proto';

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
    contest.startTime = new Date(4e12);
    contest.endTime = new Date(4e12);
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

  async modifyContest(contest: Contest): Promise<Contest> {
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
