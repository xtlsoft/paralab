import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { RoleMask } from '@paralab/proto/src/user';

@Entity()
export class UserEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column()
	registerTime: Date

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
