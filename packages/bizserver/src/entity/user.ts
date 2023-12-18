import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany } from 'typeorm';
import { RoleMask } from '@paralab/proto/src/user';
import { SubmissionEntity } from './submission';

@Entity()
export class UserEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column('bigint')
	registerTime: number	// In UNIX timestamp, milliseconds

	@Column()
	password: string

	@Column()
	roleMask: RoleMask

	@Column("jsonb")
	metadata: {
		motto: string
		email: string
	}

	@OneToMany(() => SubmissionEntity, (submission) => submission.user)
	submissions: SubmissionEntity[]
}
