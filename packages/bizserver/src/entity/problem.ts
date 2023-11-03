import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { JudgeConfig } from '@paralab/proto/src/judgeConfig';

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
}
