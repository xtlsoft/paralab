import { JudgeConfig } from "./judgeConfig"

/*
For simplicity we only define two fields for access control here: isPublic
and allowSubmitFromProblemList. isPublic means whether the problem is visible
to normal users, while allowSubmitFromProblemList means whether the problem
can be submitted from the problem list page.

Before the contest: isPublic = false, allowSubmitFromProblemList = false
During the contest: isPublic = true, allowSubmitFromProblemList = false
After the contest: isPublic = true, allowSubmitFromProblemList = true
*/
export interface Problem {
	id: number
	name: string
	isPublic: boolean
	allowSubmitFromProblemList: boolean
	metadata: {
		description: string
		judgeConfig: JudgeConfig
	},
}
