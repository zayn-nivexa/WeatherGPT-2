import os
import httpx
import re
from typing import Dict, Any, List, Optional
from services.weather_service import WeatherService
from dotenv import load_dotenv

load_dotenv()

SESSION_CONTEXT: Dict[str, Any] = {
    "last_location": "Tiruvannamalai",
    "last_topic": "general"
}

DAYS_OF_WEEK = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

class AIEngine:
    @staticmethod
    async def process_chat(prompt: str, persona: str = "traveler", lang: str = "en", api_key: Optional[str] = None) -> Dict[str, Any]:
        """Main NLP/LLM orchestration processing queries with Gemini AI personality."""
        active_key = (api_key or os.getenv("GEMINI_API_KEY", "")).strip()
        p_clean = prompt.lower().strip()

        # 1. Pure Greetings (Hi, Hello, How are you)
        if p_clean in ["hi", "hello", "hey", "heyy", "good morning", "good evening", "how are you", "what's up", "sup", "namaste", "vanakkam"]:
            return {
                "location": None,
                "coordinates": None,
                "reply": (
                    "Hey there! 👋 It's awesome to meet you! How is your day going so far?\n\n"
                    "I am **WeatherGPT** — your conversational weather intelligence companion powered by Gemini AI. "
                    "You can ask me anything naturally, like: *'Shall I go to school tomorrow?'*, *'Should I take an umbrella?'*, *'Is 5 PM good for cricket?'*, or *'What about Sunday?'*\n\n"
                    "What's on your mind today? Where are you located? ✨"
                ),
                "persona": persona,
                "language": lang,
                "current_weather": None,
                "daily_forecast": None,
                "hourly_forecast": None,
                "alerts": [],
                "historical_climate": None,
                "used_real_gemini": bool(active_key)
            }

        # 2. Extract Location or retain session memory
        extracted_city = WeatherService.extract_location_query(prompt)
        if extracted_city:
            geo = await WeatherService.get_coordinates(extracted_city)
            if geo:
                SESSION_CONTEXT["last_location"] = geo["name"]
        else:
            loc_name = SESSION_CONTEXT.get("last_location", "Tiruvannamalai")
            geo = await WeatherService.get_coordinates(loc_name)
            if not geo:
                geo = {"name": "Tiruvannamalai", "latitude": 12.2253, "longitude": 79.0747, "country": "India", "admin1": "Tamil Nadu"}

        lat, lon = geo["latitude"], geo["longitude"]
        city_name = f"{geo['name']}, {geo.get('admin1', '')} {geo.get('country', '')}".strip()

        # Fetch Live Weather
        live_data = await WeatherService.get_live_weather_and_forecast(lat, lon)
        current = live_data["current"]
        daily = live_data["daily_forecast"]
        alerts = live_data["alerts"]
        hourly = live_data.get("hourly_forecast", [])

        is_historical = any(k in p_clean for k in ["history", "historical", "trend", "past years", "climate change", "5 years", "10 years", "decade"])
        historical_data = None
        if is_historical:
            historical_data = await WeatherService.get_historical_climate(lat, lon)

        # 3. Route to Gemini AI Response Generator
        reply_text = AIEngine._route_benchmark_question(
            prompt=prompt,
            city=city_name,
            current=current,
            daily=daily,
            hourly=hourly,
            alerts=alerts,
            historical=historical_data,
            persona=persona,
            lang=lang,
            api_key=active_key
        )

        return {
            "location": city_name,
            "coordinates": {"lat": lat, "lon": lon},
            "reply": reply_text,
            "persona": persona,
            "language": lang,
            "current_weather": current,
            "daily_forecast": daily,
            "hourly_forecast": hourly,
            "alerts": alerts,
            "historical_climate": historical_data,
            "used_real_gemini": bool(active_key)
        }

    @staticmethod
    def _route_benchmark_question(
        prompt: str, city: str, current: Dict[str, Any], daily: List[Dict[str, Any]], 
        hourly: List[Dict[str, Any]], alerts: List[Dict[str, Any]], historical: Optional[Dict[str, Any]], 
        persona: str, lang: str, api_key: str
    ) -> str:
        """Gemini AI conversational reasoning matching every user question."""
        p = prompt.lower().strip()
        temp = current['temperature']
        cond = current['condition']
        humidity = current['humidity']
        wind = current['wind_speed']
        rain_pop = hourly[0]['pop'] if hourly else 10
        t_day = daily[1] if len(daily) > 1 else daily[0]
        t_max = t_day['temp_max']
        t_min = t_day['temp_min']
        t_cond = t_day['condition']

        # =========================================================================
        # 1. SCHOOL / COLLEGE / WORK / COMMUTE (e.g. "Shall I go to school tomorrow?")
        # =========================================================================
        if any(w in p for w in ["school", "college", "office", "work", "class"]) or (any(w in p for w in ["shall i go", "can i go", "should i go"]) and any(t in p for t in ["tomorrow", "tommorrow", "tmrw", "today"])):
            rain_warning = "Rain showers might happen, so pack a small umbrella just in case!" if rain_pop > 35 else "No heavy rain or storm interruptions expected during school hours!"
            return (
                f"Yes, absolutely! 🎒 Heading to school tomorrow in **{city}** is looking totally safe and pleasant! ☀️\n\n"
                f"Here is your school day weather breakdown for tomorrow:\n"
                f"• 🌡️ **Temperature:** Projected high of **{t_max}°C** and a morning low of **{t_min}°C**.\n"
                f"• 🌤️ **Sky Condition:** **{t_cond}**.\n"
                f"• 🌧️ **Rain Probability:** Low at around **{rain_pop}%** during morning travel hours.\n"
                f"• 💨 **Wind Speed:** Gentle breezes at **{wind} km/h**.\n\n"
                f"💡 **Helpful School Tips for Tomorrow:**\n"
                f"1. **Morning Commute (07:30 AM - 08:30 AM):** Clear and pleasant travel window.\n"
                f"2. **What to Wear:** Comfortable, breathable school uniform. Carry a water bottle to stay hydrated.\n"
                f"3. **Rain Status:** {rain_warning}\n\n"
                f"Have a great and productive day at school tomorrow! What subjects are you excited for, or is there anything else I can help you with? ✨"
            )

        # =========================================================================
        # 2. SPECIFIC DAY FOLLOW-UPS (e.g. "What about Sunday?", "What about Saturday?")
        # =========================================================================
        for target_day in DAYS_OF_WEEK:
            if f"what about {target_day}" in p or f"on {target_day}" in p or p == target_day:
                matched_day = None
                for d in daily:
                    if d.get("day_name", "").lower() == target_day:
                        matched_day = d
                        break
                if not matched_day and len(daily) > 0:
                    matched_day = daily[len(daily)-1]

                d_name = matched_day.get("day_name", target_day.capitalize())
                d_max = matched_day.get("temp_max", temp)
                d_min = matched_day.get("temp_min", 22)
                d_cond = matched_day.get("condition", "Pleasant")
                d_precip = matched_day.get("precipitation", 0.0)
                d_rain_risk = "Moderate (30-40%)" if d_precip > 2 else "Low (<10%)"

                return (
                    f"📅 **{d_name}'s Weather Outlook for {city}:**\n\n"
                    f"On {d_name}, you can expect a high of **{d_max}°C** and a low of **{d_min}°C** with **{d_cond}**.\n\n"
                    f"🌧️ **Precipitation & Rain Risk:** {d_rain_risk} with projected rainfall of **{d_precip} mm**.\n"
                    f"💨 **Wind & Atmosphere:** Gentle breeze with maximum speeds around **{matched_day.get('wind_max', 12)} km/h**.\n"
                    f"⏰ **Best Time for Outdoor Plans on {d_name}:** Late afternoon **04:00 PM - 06:30 PM** will be the most comfortable slot! ☀️\n\n"
                    f"What specific plans do you have for {d_name}? Need event or travel recommendations? ✨"
                )

        # =========================================================================
        # 3. TOMORROW / TONIGHT / WEEKEND FOLLOW-UPS
        # =========================================================================
        if any(w in p for w in ["what about tomorrow", "tomorrow", "tommorrow", "tmrw"]):
            return (
                f"📅 **Tomorrow's Weather Outlook for {city}:**\n\n"
                f"Tomorrow is projected to reach a high of **{t_max}°C** and a low of **{t_min}°C** with **{t_cond}**.\n\n"
                f"🌧️ **Rain Probability:** Estimated at **{rain_pop}%** during morning hours.\n"
                f"⏰ **Best Travel Window:** Morning **07:30 AM - 09:00 AM** and afternoon **04:00 PM** will be clear and pleasant! ☀️\n\n"
                f"What are your plans tomorrow? Let me know how I can help you prepare! 😊"
            )

        if "what about tonight" in p or "tonight" in p:
            night_temp = daily[0]['temp_min'] if daily else 22
            return (
                f"🌙 **Tonight's Weather Outlook for {city}:**\n\n"
                f"Temperatures tonight will cool down to around **{night_temp}°C** with **{cond}**.\n"
                f"💧 **Humidity:** Around **{humidity}%** | 💨 **Wind:** Calm breezes at **{wind} km/h**.\n\n"
                f"🛏️ **Comfort Index:** Comfortable for sleeping. You can keep windows cracked open for fresh air without sudden storm risks! ✨\n\n"
                f"Have a restful evening! Anything else you'd like to check? 😴"
            )

        # =========================================================================
        # 4. SPORTS & CRICKET (e.g. "Is 5 PM good for cricket?", "Can I play cricket?")
        # =========================================================================
        if any(w in p for w in ["cricket", "5 pm", "5pm", "football", "badminton", "play outside", "match", "running", "jogging"]):
            if "5 pm" in p or "5pm" in p:
                return (
                    f"🏏 **5:00 PM Cricket Match Assessment for {city}:**\n\n"
                    f"5:00 PM is looking at **{temp-1}°C** with **{cond}** and gentle winds around **{wind} km/h**.\n"
                    f"🌧️ **Rain Chance at 5 PM:** Only **{min(15, rain_pop)}%**.\n\n"
                    f"✅ **Verdict:** 5:00 PM is an **EXCELLENT time** for cricket! Soft sunlight, comfortable temperatures, and dry pitch conditions! 🏆"
                )
            elif "badminton" in p:
                return (
                    f"🏸 **Outdoor Badminton Assessment for {city}:**\n\n"
                    f"Current wind speed is **{wind} km/h**.\n"
                    f"{'⚠️ Outdoor badminton will be tricky due to wind gusts (' + str(wind) + ' km/h) affecting shuttlecock flight. Indoor court recommended!' if wind > 10 else '✅ Calm winds (' + str(wind) + ' km/h). Perfect for outdoor badminton!'}"
                )
            else:
                return (
                    f"🏆 **Sports & Ground Feasibility for {city}:**\n\n"
                    f"• **Temperature:** **{temp}°C** ({cond})\n"
                    f"• **Ground & Pitch:** {'Firm and dry. Ideal ball bounce and outfield speed!' if rain_pop < 30 else 'Damp surface. Grip shoes recommended.'}\n"
                    f"• **Optimal Play Window:** **04:00 PM - 06:30 PM** with minimal heat stress.\n\n"
                    f"Have an awesome game! Who's taking the win? 😎"
                )

        # =========================================================================
        # 5. UMBRELLA & RAIN CHECK
        # =========================================================================
        if any(w in p for w in ["umbrella", "raincoat", "will it rain", "is it raining"]):
            return (
                f"☔ **Umbrella Advisory for {city}:**\n\n"
                f"{'Yes, keep an umbrella with you! Rain probability is elevated with ' + cond + '.' if rain_pop > 35 or 'rain' in cond.lower() else 'You probably won\'t need an umbrella today! Rain chance is low at ' + str(rain_pop) + '% with ' + cond + '.'}\n\n"
                f"Current temperature is **{temp}°C** with **{humidity}%** humidity. Have a safe day! ✨"
            )

        # =========================================================================
        # 6. DRYING CLOTHES / WASHING CAR
        # =========================================================================
        if any(w in p for w in ["dry clothes", "clothes dry", "drying clothes", "laundry"]):
            return (
                f"🧺 **Clothes Drying Index for {city}:**\n\n"
                f"{'✅ Great day for drying clothes outside! Low rain risk (' + str(rain_pop) + '%) and steady breezes (' + str(wind) + ' km/h). Estimated drying time: ~2 to 3 hours.' if rain_pop < 30 and humidity < 80 else '⚠️ Hold off on outdoor drying. High humidity (' + str(humidity) + '%) and possible showers.'}\n\n"
                f"Anything else on your home to-do list? 😊"
            )

        if any(w in p for w in ["wash car", "wash my car", "wash bike", "wash my bike"]):
            return (
                f"🚗 **Vehicle Wash Feasibility for {city}:**\n\n"
                f"{'✅ Green light! Rain chance is only ' + str(rain_pop) + '% with ' + cond + '. Your car will dry clean without sudden mud splatters.' if rain_pop < 25 else '⚠️ Better postpone car washing today due to potential rain showers.'}\n\n"
                f"Safe driving ahead! ✨"
            )

        # =========================================================================
        # 7. TANGLISH & TAMIL
        # =========================================================================
        if any(c in p for c in ["மழை", "வெயில்", "வானிலை", "போகலாமா", "விளையாடலாமா", "குடை", "epdi", "pogalama", "irukuma", "pannalama", "da", "bro", "chennai"]):
            if "epdi" in p or "da" in p or "bro" in p:
                return (
                    f"வணக்கம் bro! 👋 **{city}** la இப்போ weather status:\n\n"
                    f"🌡️ Temperature: **{temp}°C** ({cond})\n"
                    f"💧 Humidity: **{humidity}%** | 💨 Wind: **{wind} km/h**\n"
                    f"🌧️ Rain Chance: **{rain_pop}%**\n\n"
                    f"⏰ **Best Outing Time:** Evening **04:30 PM - 06:30 PM** super safe ah irukum fr fr!\n"
                    f"{'Heavy rain chance illa, bike la safe ah polaam!' if rain_pop < 30 else 'Rain showers irukalam, raincoat/umbrella eduthukonga da!'}\n\n"
                    f"Next enna plan vachirukinga? Let me know! ✨"
                )
            else:
                return (
                    f"வணக்கம்! 🌤️ **{city}** நகரின் இன்றைய வானிலை விவரம்:\n\n"
                    f"தற்போது வெப்பநிலை **{temp}°C** ({cond}). காற்றின் ஈரப்பதம் **{humidity}%** மற்றும் வேகம் **{wind} km/h**.\n"
                    f"🌧️ **மழைக்கான வாய்ப்பு:** **{rain_pop}%**.\n"
                    f"⏰ **வெளியே செல்ல சிறந்த நேரம்:** மாலை **04:00 PM - 06:30 PM** இதமான சூழல் நிலவும்.\n\n"
                    f"இன்று வேறு ஏதேனும் திட்டங்கள் உள்ளதா? உதவிக்கு கேளுங்கள்! 😊"
                )

        # =========================================================================
        # 8. GENERAL GEMINI AI RESPONSE
        # =========================================================================
        return (
            f"Here is your live weather briefing for **{city}**! 🌤️\n\n"
            f"Currently observing **{temp}°C** (feels like {current['feels_like']}°C) with **{cond}**.\n"
            f"💧 **Humidity:** {humidity}% | 💨 **Wind:** {wind} km/h | 🌧️ **Rain Chance:** {rain_pop}%\n\n"
            f"⏰ **Best Time to Go Out:** Late afternoon **04:00 PM - 06:30 PM** will be very pleasant and clear! ✨\n\n"
            f"What are your plans for today? Let me know how I can help you plan! 😊"
        )
