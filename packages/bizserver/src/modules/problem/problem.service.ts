import { Injectable, Req, Res } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { writeFile, rm, mkdir } from 'fs/promises';
import { Dirent } from 'fs';
import { Extract } from 'unzipper';
import { Readable } from 'stream';
import { walk } from '@root/walk';

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

  async modifyProblemFiles(problemId: number, file: Express.Multer.File): Promise<{}> {
    // Generate a random file name
    const randomFileName = Math.random().toString(36).substring(2);
    const folder_path = require('path').join('/tmp', `${randomFileName}`);
    try {
      console.info(`Updating problem files for problem ${problemId}...`)
      console.log(`File size: ${file.size} bytes`)
      console.log(`Extracting to ${folder_path}...`)

      // Set up the folder
      await mkdir(folder_path);

      // Unzip the file
      const stream = Readable.from(file.buffer);
      await stream.pipe(Extract({ path: folder_path })).promise();

      console.log(`Removing old files on OSS...`)
      // Remove old files
      const bucketName = getBucketName('problems');
      const objects_stream = await minioClient.listObjects(bucketName, `${problemId}`, true);
      for await (const object of objects_stream) {
        console.log(`- Removing ${object.name}...`)
        await minioClient.removeObject(bucketName, object.name);
      }

      console.log(`Uploading new files to OSS...`)
      // Upload the files to OSS
      // Walk around all the files & subfolders in the folder, and upload them to OSS
      await walk(folder_path, async (err: any, path: string, dirent: Dirent) => {
        if (err) {
          throw err;
        }
        if (dirent.isFile()) {
          const filePath = path.substring(folder_path.length + 1);
          const objectName = `${problemId}/${filePath}`;
          console.log(`+ Uploading ${objectName}...`);
          await minioClient.fPutObject(bucketName, objectName, path, {});
        }
      })

    } catch (err) {
      // If any error occurs, delete the folder and throw the error
      try {
        await rm(folder_path, { recursive: true });
      } catch (err) {
        // Do nothing
      }
      throw err
    }

    // Delete the folder
    await rm(folder_path, { recursive: true });

    console.log(`Done`);
    
    return {}
  }

  async deleteProblem(id: number): Promise<void> {
    const result = await ProblemEntity.findOneBy({ id: id });
    if (!result) {
      throw new BadRequestException('problem not found');
    }
    await result.remove();
  }
}
