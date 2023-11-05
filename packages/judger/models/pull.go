package models

type PullMessage struct {
	ID          int64             `json:"id"`
	UserID      int64             `json:"user_id"`
	ProblemID   int64             `json:"problem_id"`
	Solution    map[string]string `json:"solution"`
	SubmittedAt int64             `json:"submitted_at"`
	Priority    int               `json:"priority"`
}
