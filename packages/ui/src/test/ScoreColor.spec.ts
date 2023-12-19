import exp from 'constants'
import { rvalue_of_score, gvalue_of_score } from '../components/ScoreColor'

describe('ScoreColor', () => {
    test('correctness of rvalue', () => {
        expect(rvalue_of_score(100)).toBe(40)
        expect(rvalue_of_score(0)).toBe(240)
        expect(rvalue_of_score(50)).toBe(140)
        expect(rvalue_of_score(75)).toBe(90)
        expect(rvalue_of_score(25)).toBe(190)
        expect(() => rvalue_of_score(101)).toThrow('x must be in [0, 100]')
    });
    test('correctness of gvalue', () => {
        expect(gvalue_of_score(100)).toBe(240)
        expect(gvalue_of_score(0)).toBe(40)
        expect(gvalue_of_score(50)).toBe(140)
        expect(gvalue_of_score(75)).toBe(190)
        expect(gvalue_of_score(25)).toBe(90)
        expect(() => gvalue_of_score(-1)).toThrow('x must be in [0, 100]')
    });
})
