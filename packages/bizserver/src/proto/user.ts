import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column()
	register_time: Date

	@Column()
	password: string

	@Column("simple-json")	// TODO bson
	metadata: {
		motto: string
		email: string
	}
}
