export interface Ranklist {
    contestId: number
    problems: {
        name: string
    }
    players: {
        userId: number
        username: string
        score: number
        rank: number
        details: {
            points : number
            status : string
        }[]
    }[]
}