export function rvalue_of_score (x : number) { 
    if (x < 0 || x > 100)
        throw new Error('x must be in [0, 100]')
    return 240 - x * 2
}

export function gvalue_of_score (x : number) {
    if (x < 0 || x > 100)
        throw new Error('x must be in [0, 100]')
    return 40 + x * 2
}
