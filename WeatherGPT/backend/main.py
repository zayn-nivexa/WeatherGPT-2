from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os

from services.weather_service import WeatherService
from services.ai_engine import AIEngine

app = FastAPI(
    title="WeatherGPT Intelligence API",
    description="Conversational AI Engine with Google Gemini API & Open-Meteo Integration",
    version="1.0.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

class ChatRequest(BaseModel):
    prompt: str
    persona: Optional[str] = "traveler"
    language: Optional[str] = "en"
    gemini_api_key: Optional[str] = None

@app.get("/")
def read_root():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "status": "online",
        "system": "WeatherGPT Intelligence Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "WeatherGPT Backend"}

@app.get("/api/weather/live")
async def get_live_weather(location: str = Query("Tiruvannamalai", description="City or place name")):
    geo = await WeatherService.get_coordinates(location)
    if not geo:
        raise HTTPException(status_code=404, detail=f"Location '{location}' not found.")
    
    data = await WeatherService.get_live_weather_and_forecast(geo["latitude"], geo["longitude"])
    data["location"] = f"{geo['name']}, {geo['country']}"
    return data

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    if not req.prompt or not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt string cannot be empty.")
    
    response = await AIEngine.process_chat(
        prompt=req.prompt,
        persona=req.persona or "traveler",
        lang=req.language or "en",
        api_key=req.gemini_api_key
    )
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
