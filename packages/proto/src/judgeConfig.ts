export interface JudgeConfig {
	num_nodes: number
	num_cpus: number
}

export const default_judge_config: JudgeConfig = {
	num_nodes: 1,
	num_cpus: 4
}
