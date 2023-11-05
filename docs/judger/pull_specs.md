# Judger Pull Specs

Judger pulls from bizlayer using the following parameters:

(With a signed key, judger will pull from bizserver)

A single pull should be done with a GET request to `/api/v1/jobs` with the following parameters:

| Parameter | Description |
| --------- | ----------- |
| `limit` | The maximum number of jobs to pull |

Authentication is done by passing the following headers:

| Header | Description |
| ------ | ----------- |
| `Authentication` | Example: `Bearer 31fef17d669565e2453b69697973d99a8b64249bec03e67c` |

An example response:

```json
[
    {
        "id": 1, // Job ID
        "user_id": 1, // Reserved for billing
        "problem_id": 1,
        "solution": {
            "code1.cpp": "bucket/filename1",
            "code2.cpp": "bucket/filename2" // Defined in problem meta
        },
        "submitted_at": "2019-01-01T00:00:00Z",
        "priority": 10 // Reserved for future use
    }
]
```
