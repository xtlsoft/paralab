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
| `X-ParaCI-Signature` | Example: `Bearer xxxx` |

`xxxx` is a HMAC-SHA256 signature plus timestamp using pre-defined keys.

The signature is: `HMAC_SHA256(method + endpoint + body (if exists) + string(bytes_arr(int64(timestamp_secs))), key) + string(bytes_arr(int64(timestamp_secs)))`.

An example response:

```json
[
    {
        "id": 1, // Job ID
        "user_id": 1, // Reserved for billing
        "problem_id": 1,
        "solution": {
            "code1.cpp": "filename1",
            "code2.cpp": "path/filename2" // Defined in problem meta
        },
        "submitted_at": "2019-01-01T00:00:00Z",
        "priority": 10 // Reserved for future use
    }
]
```

## How to use OSS

Inside problems bucket:

- `<problem_id>/meta.yml`: Problem meta
- `<problem_id>/description.md`: Problem description
- `<problem_id>/last_modified`: Last modified time of problem, in millisecond timestamp
- `<problem_id>/scripts.tar`: Scripts that will be fetched to judger by default
- `<problem_id>/assets/<asset_name>.tar.gz`: Assets that will be used in problem
- `<problem_id>/images/<image_name>.tar.gz`: Images that will be used in problem
- `<problem_id>/attachments/<attachment_name>`: Attachments that will be used in problem

Inside solutions bucket:

- `<path/filename>`: Solution files

## How to return results

A POST request to `/api/v1/jobs` with the following body:

```json
{
    "id": 1,
    "status": "running", // running / waiting / completed
    "result": {
        "score": 100,
        "status": "AC",
        "artifacts": {
            "artifact1": "path/filename1",
            "artifact2": "path/filename2"
        },
        "extra": {}
    }
}
```

If error:

```json
{
    "id": 1,
    "result": {
        "error": "error message"
    }
}
```
