# CampusMatcher

CampusMatcher is a mobile application that matches university students who plan to attend the same campus activity (library, gym, cafeteria) at the same time, so that nobody has to go alone.

BLG411E Software Engineering – 2026-2027 Fall Term

## Team

| Member | GitHub | Development Role | Management Role |
|---|---|---|---|
| Enes Durukan | @DurukanEnes | Mobile Developer | Project Manager |
| Erinç Özarı | @ituitis20-ozari19 | Mobile Developer & UI/UX Designer | Mobile Team Lead |
| Mohammed Alashi | @Mohammed-Alashi | Backend Developer | Backend Team Lead |
| Ali Çetin | @ali-cetin-itu | Backend Developer & DevOps Engineer | DevOps Lead |
| İbrahim Meral | @itu-itis23-merali22 | Backend Developer & QA Engineer | QA Lead |

## Repository Structure

- `app/` – FastAPI backend and responsive local demo
- `docs/` – Project documents (Charter, Project Plan, Requirements Spec, Requirements Analysis, Design Spec, Test Spec)
- `tests/` – All tests
  - `unit/` – Unit tests
  - `integration/` – Integration tests
  - `security/` – Security tests
  - `performance/` – Performance tests

## Run the local demo

The starter app runs in a browser and provides an activity feed and a form for publishing a demo activity. In PowerShell, from the repository root:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Open the browser demo at `http://127.0.0.1:8000/app`. The API root is `http://127.0.0.1:8000/`, the health check is at `http://127.0.0.1:8000/health`, and the interactive API docs are at `http://127.0.0.1:8000/docs`. Stop the server with `Ctrl+C`.

Run the unit tests with `.\.venv\Scripts\python.exe -m pytest`. This is a local prototype: activity data is in memory and resets when the server restarts; accounts, matching, and chat are not implemented yet.

## Workflow

- Nobody commits directly to `main`; all changes go through a branch and a pull request.
- Every pull request needs at least one approval from a teammate before merging.
- Requests from customer meetings are tracked as issues with the `customer-requests` label.
