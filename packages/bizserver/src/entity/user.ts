import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { RoleMask } from '@paralab/proto/src/user';

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
}
