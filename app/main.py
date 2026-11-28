
from fastapi import FastAPI

from app.auth.router import router as auth_router
from app.notifications.router import router as notifications_router

app = FastAPI(title="CampusMatcher API")
app.include_router(auth_router)
app.include_router(notifications_router)


@app.get("/")
def root():
    return {"message": "CampusMatcher Backend is running!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
