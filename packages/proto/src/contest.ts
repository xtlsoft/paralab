export interface Contest {
	id: number
	name: string
	startTime: number	// In UNIX timestamp, milliseconds
	endTime: number	// In UNIX timestamp, milliseconds
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
	startTime: number	// In UNIX timestamp, milliseconds
	endTime: number	// In UNIX timestamp, milliseconds
	isPublic: boolean
}
