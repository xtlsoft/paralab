import { JudgeResult } from "judgeResult"

export interface Submission {
	id: number
	userId: number
	problemId: number
	contestId: number | null
	submitTime: number	// In UNIX timestamp, milliseconds
	verdict: "waiting" | "running" | "completed"
	score: number
	judgeResult: JudgeResult
}
