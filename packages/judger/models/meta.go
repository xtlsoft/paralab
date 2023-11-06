package models

type ProblemMeta struct {
	Title         string                       `json:"title" yaml:"title"`
	Entrance      string                       `json:"entrance" yaml:"entrance"`
	Assets        []string                     `json:"assets" yaml:"assets"`
	Attachments   []string                     `json:"attachments" yaml:"attachments"`
	Artifacts     []string                     `json:"artifacts" yaml:"artifacts"`
	SolutionFiles map[string]*SolutionFileMeta `json:"solution_files" yaml:"solution_files"`
}

type SolutionFileMeta struct {
	Type              string   `json:"type" yaml:"type"`
	Language          string   `json:"language" yaml:"language"`
	AllowedExtensions []string `json:"allowed_extensions" yaml:"allowed_extensions"`
}
