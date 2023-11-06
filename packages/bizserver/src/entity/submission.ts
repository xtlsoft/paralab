import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { JudgeResult } from '@paralab/proto';

@Entity()
export class SubmissionEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	userId: number

	@Column()
	problemId: number

	@Column()
	contestId: number	// "0" indicates that the submission is not in a contest

	@Column("bigint")
	submitTime: number	// In UNIX timestamp, milliseconds

	@Column("enum", { enum: ["waiting", "running", "completed"] })
	verdict: "waiting" | "running" | "completed"

	@Column("float4")
	score: number
	
	@Column("jsonb")
	judgeResult: JudgeResult
}
