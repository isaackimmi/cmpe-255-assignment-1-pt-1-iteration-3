import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from server.api.routes_eda import router as eda_router
from server.api.routes_models import router as models_router
from server.api.routes_matches import router as matches_router
from server.api.routes_predict import router as predict_router

app = FastAPI(
    title="CMPE 255 European Soccer Analytics & Pre-Kickoff Prediction API",
    description="CRISP-DM Home Advantage Analytics and Match Outcome Prediction System",
    version="3.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(eda_router)
app.include_router(models_router)
app.include_router(matches_router)
app.include_router(predict_router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "3.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)
