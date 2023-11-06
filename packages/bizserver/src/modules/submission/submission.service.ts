import { Injectable, UnsupportedMediaTypeException } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common";

import { SubmissionEntity } from 'src/entity/submission';
import { minioClient, getBucketName } from 'src/minio';

import { RoleMask, Submission, ProblemListItem, ROLE_PROBLEMSET_ADMIN, ROLE_CONTEST_ADMIN, ContestListItem, Job, SubmissionVerdict } from "@paralab/proto";
import { JudgeResult, default_judge_result } from '@paralab/proto';
import { ProblemEntity } from "src/entity/problem";
import { ContestEntity } from "src/entity/contest";
import { UserEntity } from "src/entity/user";
import { Brackets } from "typeorm";
import { query } from "express";

@Injectable()
export class SubmissionService {
  async getSubmissionList(startIndex: number, count: number, userId: number | undefined, userRoles: RoleMask):
    Promise<{submissions: Submission[], total_visible_submission_count: number}> {
    if (count > 100) {
      throw new BadRequestException('count is too large');
    }
    let query_builder = SubmissionEntity.createQueryBuilder('submission')
    .leftJoinAndSelect('submission.user', 'user')
    .leftJoinAndSelect('submission.problem', 'problem')
    .leftJoinAndSelect('submission.contest', 'contest')
    .orderBy('submission.id', 'DESC');
    // PROBLEMSET_ADMINs and CONTEST_ADMIN can see all submissions regardless of their visibility
    if (!(userRoles & ROLE_PROBLEMSET_ADMIN) && !(userRoles & ROLE_CONTEST_ADMIN)) {
      query_builder = query_builder.where('submission.user = :userId', { userId: userId ? userId : -1 })
        .orWhere(new Brackets((qb) => {
          qb.where("problem.isPublic = true")
            .andWhere("contest.id IS NULL")
        }));
    }
    const total_visible_submission_count = await query_builder.getCount();
    query_builder = query_builder.skip(startIndex).take(count);
    return {
      submissions: await query_builder.getMany(),
      total_visible_submission_count
    }
  }

  // Submit a solution to the database and return its submissionId
  async submitSolutionToDB(problemId: number, contestId: number | undefined, userId: number): Promise<number> {
    let submission: SubmissionEntity = new SubmissionEntity();
    submission.user = await UserEntity.findOneBy({ id: userId });
    submission.problem = await ProblemEntity.findOneBy({ id: problemId });
    submission.contest = contestId === undefined ? null : await ContestEntity.findOneBy({ id: contestId });
    submission.submitTime = Date.now();
    submission.verdict = 'waiting';
    submission.score = 0;
    submission.judgeResult = default_judge_result;
    await submission.save();
    return submission.id;
  }
  
  // Submit a solution to OSS
  async submitSolutionToOSS(submissionId: number, file: Express.Multer.File): Promise<void> {
    const bucket_name: string = getBucketName('submissions');
    const object_name: string = `submission-${submissionId}`
    await minioClient.putObject(bucket_name, object_name, file.buffer);
  }

  async getSubmissionById(submissionId: number): Promise<Submission> {
    const result = await SubmissionEntity.findOne({
      where: { id: submissionId },
      relations: ['user', 'problem', 'contest']
    });
    if (!result) {
      throw new BadRequestException('problem not found');
    }
    return result;
  }

  // Get jobs (for ParaCI)
  async getJobs(jobs_limit: number): Promise<Job[]> {
    let query_builder = SubmissionEntity.createQueryBuilder('submission')
      .leftJoinAndSelect('submission.user', 'user')
      .leftJoinAndSelect('submission.problem', 'problem')
      .orderBy('submission.id', 'ASC')
      .where('submission.verdict = :verdict', { verdict: 'waiting' })
      .limit(jobs_limit);
    const submissions: Submission[] = await query_builder.getMany();
    return submissions.map((submission) => {
      return {
        id: submission.id,
        user_id: submission.user.id,
        problem_id: submission.problem.id,
        solution: {
          solution: `paralab-submissions/submission-${submission.id}` // This is the object name in OSS
        },
        submitted_at: submission.submitTime,
        priority: 0
      }
    });
  }

  // Update job status (for ParaCI)
  async updateJobStatus(id: number, verdict: SubmissionVerdict, score: number, result: JudgeResult): Promise<void> {
    await SubmissionEntity.update({ id: id }, {
      verdict: verdict,
      score: score,
      judgeResult: result
    });
  }
}