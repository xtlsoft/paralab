import { Contest } from "contest"
import { JudgeResult } from "judgeResult"
import { Problem } from "problem"
import { User } from "user"

export interface Submission {
	id: number
	user: User
	problem: Problem
	contest: Contest | null
	submitTime: number	// In UNIX timestamp, milliseconds
	verdict: "waiting" | "running" | "completed"
	score: number
	judgeResult: JudgeResult
}
