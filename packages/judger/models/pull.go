package models

type PullMessage struct {
	ID        int64             `json:"id"`
	UserID    int64             `json:"user_id"`
	ProblemID int64             `json:"problem_id"`
	Solution  map[string]string `json:"solution"`
	// SubmittedAt time.Time         `json:"submitted_at"`
	Priority int `json:"priority"`
}

const (
	ResultStatusRunning   = "running"
	ResultStatusWaiting   = "waiting"
	ResultStatusCompleted = "completed"
	ResultStatusFailed    = "failed"
)

type ResultMessage struct {
	ID     int64       `json:"id"`
	Status string      `json:"status"`
	Result *ResultBody `json:"result"`
}

type ResultBody struct {
	Error     error                  `json:"error,omitempty"`
	Score     int                    `json:"score"`
	Status    string                 `json:"status"`
	Artifacts map[string]string      `json:"artifacts"`
	Extra     map[string]interface{} `json:"extra"`
}
