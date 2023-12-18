import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany } from 'typeorm';
import { JudgeConfig } from '@paralab/proto/src/judgeConfig';

import { SubmissionEntity } from './submission';

@Entity()
export class ProblemEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column()
	isPublic: boolean

	@Column()
	allowSubmitFromProblemList: boolean

	@Column("jsonb")
	metadata: {
		description: string
		judgeConfig: JudgeConfig
	}

	@OneToMany(() => SubmissionEntity, (submission) => submission.problem)
	submissions: SubmissionEntity[]
}
