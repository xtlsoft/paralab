import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

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
}
