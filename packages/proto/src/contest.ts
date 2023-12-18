export interface Contest {
	id: number
	name: string
	startTime: Date
	endTime: Date
	isPublic: boolean
	metadata: {
		description: string
		problems: {
			id: number
			weight: number
		}[]
	}
}

// ContestWithProblemName: Contest + problem name
export interface ContestWithProblemName extends Contest {
	metadata: {
		description: string
		problems: {
			id: number
			weight: number
			name: string
		}[]
	}
}

// ContestListItem: a simplified version of Contest, used in contest list
export interface ContestListItem {
	id: number,
	name: string
	startTime: Date
	endTime: Date
	isPublic: boolean
}
