sol = read_solution("solution")

print(sol)

if len(sol) > 10:
    result(score=100, status="AC", extra={})
else:
    result(score=0, status="WA", extra={})
