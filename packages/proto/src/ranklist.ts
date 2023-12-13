export interface Ranklist {
    players: {
        userId: number
        username: string
        score: number
        details: {
            score: number,
            submitTime: number  // Unix timestamp, in milliseconds
        }[] // The order of this array is the same as the order of problems in the contest
    }[]
}