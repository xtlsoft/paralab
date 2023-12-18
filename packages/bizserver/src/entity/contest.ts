import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany } from 'typeorm';
import { SubmissionEntity } from './submission';

@Entity()
export class ContestEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column('bigint')
	startTime: number	// In UNIX timestamp, milliseconds
	
	@Column('bigint')
	endTime: number	// In UNIX timestamp, milliseconds

	@Column()
	isPublic: boolean

	@Column("jsonb")
	metadata: {
		description: string
		problems: {
			id: number
			weight: number
		}[]
	}

	@OneToMany(() => SubmissionEntity, (submission) => submission.contest)
	submissions: SubmissionEntity[]
}
