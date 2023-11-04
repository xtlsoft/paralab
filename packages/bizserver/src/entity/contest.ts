import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class ContestEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column()
	startTime: Date
	
	@Column()
	endTime: Date

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
