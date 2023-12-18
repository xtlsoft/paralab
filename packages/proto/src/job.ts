export interface Job {
	id: number 		// The same as submissionId
	user_id: number
	problem_id: number
	solution: {
		solution: string
	}
	submitted_at: number	// In UNIX timestamp, milliseconds
	priority: number
}
