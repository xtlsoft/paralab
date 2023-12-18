sol = read_solution("solution")

out = run_user_code(sol, input="1 2\n")

if out == "3\n":
    result(score=100, status="AC", extra={})
else:
    result(score=0, status="WA", extra={})
