import { Contest } from "contest"
import { JudgeResult } from "judgeResult"
import { Problem } from "problem"
import { User } from "user"

export type SubmissionVerdict = "waiting" | "running" | "completed" | "failed"
export const submission_verdicts = ["waiting", "running", "completed", "failed"]

export interface Submission {
	id: number
	user: User
	problem: Problem
	contest: Contest | null
	submitTime: number	// In UNIX timestamp, milliseconds
	verdict: SubmissionVerdict
	score: number
	judgeResult: JudgeResult
}
