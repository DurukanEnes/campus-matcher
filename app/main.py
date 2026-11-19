
from fastapi import FastAPI

app = FastAPI(title="CampusMatcher API")


@app.get("/")
def root():
    return {"message": "CampusMatcher Backend is running!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
