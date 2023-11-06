import { Injectable } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common";

import { SubmissionEntity } from 'src/entity/submission';
import { minioClient, getBucketName } from 'src/minio';

import { Submission } from "@paralab/proto";
import { JudgeResult, default_judge_result } from '@paralab/proto';

@Injectable()
export class SubmissionService {
  // Submit a solution to the database and return its submissionId
  async submitSolutionToDB(problemId: number, contestId: number | undefined, userId: number): Promise<number> {
    let submission: SubmissionEntity = new SubmissionEntity();
    submission.userId = userId;
    submission.problemId = problemId;
    submission.contestId = contestId === undefined ? 0 : contestId;
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
    const result = await SubmissionEntity.findOneBy({ id: submissionId });
    if (!result) {
      throw new BadRequestException('problem not found');
    }
    return result;
  }
}