import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne } from 'typeorm';
import { JudgeResult } from '@paralab/proto';
import { ProblemEntity } from './problem';
import { ContestEntity } from './contest';
import { UserEntity } from './user';

@Entity()
export class SubmissionEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => UserEntity, (user) => user.submissions)
	user: UserEntity

	@ManyToOne(() => ProblemEntity, (problem) => problem.submissions)
	problem: ProblemEntity

	@ManyToOne(() => ContestEntity, (contest) => contest.submissions)
	contest: ContestEntity	// "0" indicates that the submission is not in a contest

	@Column("bigint")
	submitTime: number	// In UNIX timestamp, milliseconds

	@Column("enum", { enum: ["waiting", "running", "completed"] })
	verdict: "waiting" | "running" | "completed"

	@Column("float4")
	score: number
	
	@Column("jsonb")
	judgeResult: JudgeResult

}
