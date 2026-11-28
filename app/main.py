
from fastapi import FastAPI

from app.routers.venues import router as venues_router

app = FastAPI(title="CampusMatcher API")


app.include_router(venues_router)


@app.get("/")
def root():
    return {"message": "CampusMatcher Backend is running!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
