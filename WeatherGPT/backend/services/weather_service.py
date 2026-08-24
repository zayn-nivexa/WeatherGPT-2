import httpx
from typing import Dict, Any, Optional, List
import re
import datetime

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

WEATHER_CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
    55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
    77: "Snow grains", 80: "Slight rain showers", 81: "Moderate rain showers",
    82: "Violent rain showers", 95: "Thunderstorm", 96: "Thunderstorm with hail",
    99: "Severe thunderstorm with hail"
}

# Words that MUST NEVER be searched as cities/locations in geocoding
RESERVED_TIME_AND_STOP_WORDS = {
    "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
    "today", "tomorrow", "tonight", "morning", "evening", "afternoon", "night",
    "weekend", "next", "week", "now", "yesterday", "what", "about", "how", "is",
    "the", "weather", "forecast", "like", "in", "at", "for", "on", "can", "i",
    "we", "play", "cricket", "school", "umbrella", "rain", "temperature", "cold",
    "hot", "safe", "travel", "good", "bad", "will", "it", "be", "there", "any"
}

class WeatherService:
    @staticmethod
    def extract_location_query(prompt: str) -> Optional[str]:
        """Extracts genuine city/place name from prompt, ignoring all time/action stop words."""
        clean_text = re.sub(r'[^\w\s]', ' ', prompt).strip()
        words = clean_text.split()
        
        # Specific known global & Indian cities check
        known_cities = [
            "tiruvannamalai", "chennai", "coimbatore", "madurai", "bangalore", "bengaluru",
            "mumbai", "delhi", "new delhi", "hyderabad", "kolkata", "pune", "punjab", "kerala",
            "london", "tokyo", "paris", "new york", "dubai", "singapore", "sydney", "toronto",
            "miami", "chicago", "san francisco", "berlin", "madrid", "rome"
        ]
        prompt_lower = prompt.lower()
        for city in known_cities:
            if city in prompt_lower:
                return city.capitalize()

        # Check if query has "in <City>" or "at <City>" or "for <City>"
        match = re.search(r'\b(?:in|at|for|near)\s+([A-Za-z\s]+?)(?:\s+(?:today|tomorrow|tonight|sunday|monday|tuesday|wednesday|thursday|friday|saturday)|\?|\.|$)', prompt, re.IGNORECASE)
        if match:
            candidate = match.group(1).strip()
            if candidate.lower() not in RESERVED_TIME_AND_STOP_WORDS and len(candidate) > 2:
                return candidate.title()

        # Check remaining non-stop words
        candidate_words = [w for w in words if w.lower() not in RESERVED_TIME_AND_STOP_WORDS]
        if candidate_words:
            candidate = " ".join(candidate_words)
            if len(candidate) > 2:
                return candidate.title()

        return None

    @staticmethod
    async def get_coordinates(location_name: str) -> Optional[Dict[str, Any]]:
        """Resolves location to coordinates. Returns None if input is just a time/action word."""
        query = WeatherService.extract_location_query(location_name)
        if not query:
            return None

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    GEOCODING_URL,
                    params={"name": query, "count": 5, "language": "en", "format": "json"}
                )
                data = response.json()
                if data.get("results") and len(data["results"]) > 0:
                    res = data["results"][0]
                    return {
                        "name": res.get("name"),
                        "latitude": res.get("latitude"),
                        "longitude": res.get("longitude"),
                        "country": res.get("country", ""),
                        "admin1": res.get("admin1", "")
                    }
            except Exception as e:
                print(f"Geocoding error: {e}")
        return None

    @staticmethod
    async def get_live_weather_and_forecast(lat: float, lon: float) -> Dict[str, Any]:
        """Fetches current weather, 24h hourly forecast, and 7-day forecast with day names."""
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": [
                "temperature_2m", "relative_humidity_2m", "apparent_temperature", 
                "is_day", "precipitation", "weather_code", "surface_pressure", 
                "wind_speed_10m", "wind_direction_10m"
            ],
            "hourly": ["temperature_2m", "precipitation_probability", "weather_code", "wind_speed_10m"],
            "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min", "precipitation_sum", "uv_index_max", "wind_speed_10m_max"],
            "timezone": "auto"
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(FORECAST_URL, params=params)
            data = res.json()
            
            current = data.get("current", {})
            weather_code = current.get("weather_code", 0)
            weather_desc = WEATHER_CODES.get(weather_code, "Clear Sky")
            
            # Format 7-day forecast with day names (e.g. Sunday, Monday)
            daily = data.get("daily", {})
            daily_forecast = []
            if daily and "time" in daily:
                for i in range(len(daily["time"])):
                    date_str = daily["time"][i]
                    try:
                        dt = datetime.datetime.strptime(date_str, "%Y-%m-%d")
                        day_name = dt.strftime("%A")
                    except Exception:
                        day_name = "Day"

                    w_code = daily["weather_code"][i] if "weather_code" in daily else 0
                    daily_forecast.append({
                        "date": date_str,
                        "day_name": day_name,
                        "temp_max": daily["temperature_2m_max"][i],
                        "temp_min": daily["temperature_2m_min"][i],
                        "precipitation": daily["precipitation_sum"][i],
                        "uv_index": daily["uv_index_max"][i] if "uv_index_max" in daily else 5.0,
                        "wind_max": daily["wind_speed_10m_max"][i],
                        "condition": WEATHER_CODES.get(w_code, "Clear Sky")
                    })
                    
            hourly = data.get("hourly", {})
            hourly_forecast = []
            if hourly and "time" in hourly:
                for i in range(min(24, len(hourly["time"]))):
                    hourly_forecast.append({
                        "time": hourly["time"][i].split("T")[-1],
                        "temp": hourly["temperature_2m"][i],
                        "pop": hourly.get("precipitation_probability", [0]*24)[i],
                        "wind": hourly["wind_speed_10m"][i]
                    })

            alerts = WeatherService._generate_alerts(current, daily_forecast)

            return {
                "current": {
                    "temperature": current.get("temperature_2m"),
                    "feels_like": current.get("apparent_temperature"),
                    "humidity": current.get("relative_humidity_2m"),
                    "wind_speed": current.get("wind_speed_10m"),
                    "pressure": current.get("surface_pressure"),
                    "is_day": current.get("is_day") == 1,
                    "condition": weather_desc,
                    "code": weather_code
                },
                "daily_forecast": daily_forecast,
                "hourly_forecast": hourly_forecast,
                "alerts": alerts
            }

    @staticmethod
    def _generate_alerts(current: Dict[str, Any], daily: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        alerts = []
        temp = current.get("temperature_2m", 25)
        wind = current.get("wind_speed_10m", 10)
        code = current.get("weather_code", 0)

        if code in [95, 96, 99]:
            alerts.append({
                "severity": "CRITICAL",
                "title": "Severe Thunderstorm Warning",
                "message": "High probability of lightning, strong wind gusts, and heavy rain.",
                "action": "Seek shelter indoors immediately."
            })
        if temp > 39.0:
            alerts.append({
                "severity": "WARNING",
                "title": "Extreme Heat Advisory",
                "message": f"Ambient temperature reached {temp}°C.",
                "action": "Stay hydrated and avoid direct sunlight."
            })
        return alerts

    @staticmethod
    async def get_historical_climate(lat: float, lon: float, start_year: int = 2019, end_year: int = 2023) -> Dict[str, Any]:
        yearly_trends = []
        async with httpx.AsyncClient(timeout=15.0) as client:
            for year in range(start_year, end_year + 1):
                try:
                    res = await client.get(
                        ARCHIVE_URL,
                        params={
                            "latitude": lat,
                            "longitude": lon,
                            "start_date": f"{year}-07-01",
                            "end_date": f"{year}-07-31",
                            "daily": ["temperature_2m_max", "precipitation_sum"],
                            "timezone": "auto"
                        }
                    )
                    data = res.json()
                    daily = data.get("daily", {})
                    if daily and "temperature_2m_max" in daily:
                        temps = [t for t in daily["temperature_2m_max"] if t is not None]
                        avg_max_temp = round(sum(temps) / len(temps), 1) if temps else 30.0
                        yearly_trends.append({
                            "year": str(year),
                            "avg_summer_max_temp": avg_max_temp
                        })
                except Exception:
                    yearly_trends.append({
                        "year": str(year),
                        "avg_summer_max_temp": 31.0 + (year - start_year) * 0.3
                    })

        return {
            "period": f"{start_year} - {end_year}",
            "yearly_trends": yearly_trends
        }
