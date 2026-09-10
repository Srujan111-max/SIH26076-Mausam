from datetime import datetime
from typing import Any

import requests


GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

# ALLOWED_PERSONAS is kept as an alias for compatibility with existing imports.
ALLOWED_ROLES = {"runner", "farmer", "commuter", "traveller"}
ALLOWED_PERSONAS = ALLOWED_ROLES

WEATHER_CODES = {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Heavy drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
}


class WeatherServiceError(Exception):
    """Expected error while looking up a location or weather data."""


def get_json(url: str, params: dict[str, Any]) -> dict[str, Any]:
    """Call an external API safely and return JSON."""
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        return response.json()

    except requests.Timeout as error:
        raise WeatherServiceError("Weather service took too long to respond.") from error

    except requests.RequestException as error:
        raise WeatherServiceError("Could not contact the weather service.") from error

    except ValueError as error:
        raise WeatherServiceError("Weather service returned invalid JSON.") from error


def geocode_location(location: str) -> dict[str, Any]:
    """Convert a location name into latitude and longitude."""
    cleaned_location = location.strip()

    if not cleaned_location:
        raise WeatherServiceError("Location cannot be empty.")

    data = get_json(
        GEOCODING_URL,
        {
            "name": cleaned_location,
            "count": 1,
            "language": "en",
            "format": "json",
        },
    )

    results = data.get("results", [])

    if not results:
        raise WeatherServiceError(
            f"Location '{cleaned_location}' was not found. Try a city name such as Bengaluru."
        )

    place = results[0]

    return {
        "name": place["name"],
        "state": place.get("admin1"),
        "country": place.get("country"),
        "latitude": place["latitude"],
        "longitude": place["longitude"],
        "timezone": place.get("timezone", "auto"),
    }


def fetch_weather(latitude: float, longitude: float) -> dict[str, Any]:
    """Fetch current, hourly, and daily forecast data from Open-Meteo."""
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "timezone": "auto",
        "forecast_days": 3,
        "current": (
            "temperature_2m,relative_humidity_2m,apparent_temperature,"
            "precipitation,rain,weather_code,wind_speed_10m,"
            "wind_gusts_10m,visibility,is_day"
        ),
        "hourly": (
            "temperature_2m,relative_humidity_2m,apparent_temperature,"
            "precipitation_probability,precipitation,rain,weather_code,"
            "wind_speed_10m,wind_gusts_10m,visibility,soil_moisture_0_to_1cm"
        ),
        "daily": (
            "weather_code,temperature_2m_max,temperature_2m_min,"
            "precipitation_probability_max,precipitation_sum,rain_sum,"
            "wind_gusts_10m_max,uv_index_max,sunrise,sunset"
        ),
    }

    return get_json(FORECAST_URL, params)


def weather_description(code: int | None) -> str:
    """Convert an Open-Meteo numeric weather code into readable text."""
    return WEATHER_CODES.get(code, "Unknown weather condition")


def find_current_hour_index(hourly: dict[str, list[Any]], current_time: str) -> int:
    """Find the hourly forecast item closest to the current API timestamp."""
    times = hourly.get("time", [])

    try:
        return times.index(current_time)
    except ValueError:
        return 0


def make_hourly_preview(hourly: dict[str, list[Any]], start_index: int) -> list[dict[str, Any]]:
    """Return the next six hourly forecast entries."""
    preview = []
    end_index = min(start_index + 6, len(hourly.get("time", [])))

    for index in range(start_index, end_index):
        preview.append(
            {
                "time": hourly["time"][index],
                "temperature_c": hourly["temperature_2m"][index],
                "feels_like_c": hourly["apparent_temperature"][index],
                "humidity_percent": hourly["relative_humidity_2m"][index],
                "rain_probability_percent": hourly["precipitation_probability"][index],
                "precipitation_mm": hourly["precipitation"][index],
                "rain_mm": hourly["rain"][index],
                "wind_kmh": hourly["wind_speed_10m"][index],
                "wind_gust_kmh": hourly["wind_gusts_10m"][index],
                "visibility_m": hourly["visibility"][index],
                "condition": weather_description(hourly["weather_code"][index]),
            }
        )

    return preview


def make_daily_preview(daily: dict[str, list[Any]]) -> list[dict[str, Any]]:
    """Return the next three daily forecasts."""
    preview = []

    for index, date in enumerate(daily.get("time", [])):
        preview.append(
            {
                "date": date,
                "condition": weather_description(daily["weather_code"][index]),
                "min_temperature_c": daily["temperature_2m_min"][index],
                "max_temperature_c": daily["temperature_2m_max"][index],
                "max_rain_probability_percent": daily["precipitation_probability_max"][index],
                "rain_total_mm": daily["rain_sum"][index],
                "max_wind_gust_kmh": daily["wind_gusts_10m_max"][index],
                "max_uv_index": daily["uv_index_max"][index],
                "sunrise": daily["sunrise"][index],
                "sunset": daily["sunset"][index],
            }
        )

    return preview


def normalize_weather(location: dict[str, Any], raw_weather: dict[str, Any]) -> dict[str, Any]:
    """
    Convert Open-Meteo provider data into the app's stable normalized structure.
    """
    current = raw_weather.get("current")
    hourly = raw_weather.get("hourly")
    daily = raw_weather.get("daily")

    if not current or not hourly or not daily:
        raise WeatherServiceError("Weather provider sent incomplete forecast data.")

    current_hour_index = find_current_hour_index(hourly, current["time"])

    return {
        "location": {
            "name": location["name"],
            "state": location["state"],
            "country": location["country"],
            "latitude": location["latitude"],
            "longitude": location["longitude"],
            "timezone": raw_weather.get("timezone"),
        },
        "current": {
            "time": current["time"],
            "temperature_c": current["temperature_2m"],
            "humidity_percent": current["relative_humidity_2m"],
            "feels_like_c": current["apparent_temperature"],
            "condition": weather_description(current["weather_code"]),
            "weather_code": current["weather_code"],
            "precipitation_mm": current["precipitation"],
            "rain_mm": current["rain"],
            "wind_kmh": current["wind_speed_10m"],
            "wind_gust_kmh": current["wind_gusts_10m"],
            "visibility_m": current["visibility"],
            "is_day": bool(current["is_day"]),
        },
        "next_hours": make_hourly_preview(hourly, current_hour_index),
        "next_days": make_daily_preview(daily),
        "farmer_data": {
            "surface_soil_moisture_m3_m3": hourly["soil_moisture_0_to_1cm"][current_hour_index]
        },
        "source": "Open-Meteo",
    }


def get_weather_for_location(location_name: str) -> dict[str, Any]:
    """Get fully normalized weather for one location."""
    location = geocode_location(location_name)
    raw_weather = fetch_weather(location["latitude"], location["longitude"])
    return normalize_weather(location, raw_weather)


def create_alert(level: str, title: str, message: str) -> dict[str, str]:
    return {
        "level": level,
        "title": title,
        "message": message,
    }


def personalize_for_commuter(weather: dict[str, Any]) -> list[dict[str, str]]:
    current = weather["current"]
    next_hours = weather["next_hours"]
    alerts = []

    rain_soon = any(
        hour["rain_probability_percent"] >= 50 or hour["precipitation_mm"] >= 0.2
        for hour in next_hours
    )

    if rain_soon:
        alerts.append(
            create_alert(
                "high",
                "Rain likely",
                "Carry an umbrella and allow extra time for your commute.",
            )
        )

    if current["visibility_m"] < 1000:
        alerts.append(
            create_alert(
                "high",
                "Low visibility",
                "Drive slowly and keep extra distance from other vehicles.",
            )
        )

    if current["wind_gust_kmh"] >= 40:
        alerts.append(
            create_alert(
                "medium",
                "Strong wind",
                "Take extra care when riding a two-wheeler.",
            )
        )

    if not alerts:
        alerts.append(
            create_alert(
                "low",
                "Commute looks suitable",
                "No major rain, visibility, or wind concern detected.",
            )
        )

    return alerts


def personalize_for_farmer(weather: dict[str, Any]) -> list[dict[str, str]]:
    current = weather["current"]
    today = weather["next_days"][0]
    soil_moisture = weather["farmer_data"]["surface_soil_moisture_m3_m3"]
    alerts = []

    if today["rain_total_mm"] >= 10:
        alerts.append(
            create_alert(
                "high",
                "Heavy rain possible",
                "Check drainage and avoid irrigation before expected rainfall.",
            )
        )
    elif today["rain_total_mm"] >= 2:
        alerts.append(
            create_alert(
                "medium",
                "Rain expected",
                "Review irrigation plans because rainfall is forecast today.",
            )
        )

    if soil_moisture < 0.15:
        alerts.append(
            create_alert(
                "medium",
                "Low surface soil moisture",
                "Inspect field moisture before deciding irrigation.",
            )
        )

    if current["temperature_c"] >= 35:
        alerts.append(
            create_alert(
                "medium",
                "High temperature",
                "Monitor crops for heat stress and avoid relying on forecast alone.",
            )
        )

    if not alerts:
        alerts.append(
            create_alert(
                "low",
                "No major field condition found",
                "Review the forecast before making farm decisions.",
            )
        )

    return alerts


def personalize_for_runner(weather: dict[str, Any]) -> list[dict[str, str]]:
    current = weather["current"]
    next_hours = weather["next_hours"]
    today = weather["next_days"][0]
    alerts = []

    suitable_hour = next(
        (
            hour
            for hour in next_hours
            if hour["rain_probability_percent"] < 30
            and hour["precipitation_mm"] < 0.2
            and 16 <= hour["feels_like_c"] <= 32
            and hour["wind_kmh"] < 25
            and hour["visibility_m"] >= 1000
        ),
        None,
    )

    if current["feels_like_c"] >= 35:
        alerts.append(
            create_alert(
                "high",
                "Too hot for strenuous running",
                "Choose a cooler time, reduce intensity, and drink water.",
            )
        )

    if today["max_uv_index"] >= 8:
        alerts.append(
            create_alert(
                "medium",
                "High UV forecast",
                "Avoid peak sun where possible and use sun protection.",
            )
        )

    if suitable_hour:
        alerts.append(
            create_alert(
                "low",
                "Suggested running window",
                f"Conditions look relatively suitable around {suitable_hour['time']}.",
            )
        )
    else:
        alerts.append(
            create_alert(
                "medium",
                "No ideal running window found",
                "Check the hourly forecast again later or consider indoor exercise.",
            )
        )

    return alerts


def personalize_for_traveller(
    current_weather: dict[str, Any],
    destination_weather: dict[str, Any],
) -> tuple[list[dict[str, str]], str]:
    """
    Generate traveller alerts and a recommendation using destination weather.
    """
    destination_current = destination_weather["current"]
    destination_days = destination_weather["next_days"][:2]
    alerts = []

    heavy_rain = any(
        day["max_rain_probability_percent"] >= 60 or day["rain_total_mm"] >= 10
        for day in destination_days
    )

    strong_wind = any(
        day["max_wind_gust_kmh"] >= 50
        for day in destination_days
    )

    if heavy_rain:
        alerts.append(
            create_alert(
                "high",
                "Rain may affect your destination",
                "Check local transport conditions and carry rain protection.",
            )
        )

    if strong_wind:
        alerts.append(
            create_alert(
                "medium",
                "Strong wind at destination",
                "Allow extra travel time and check transport updates.",
            )
        )

    if destination_current["temperature_c"] >= 35:
        alerts.append(
            create_alert(
                "medium",
                "Hot destination conditions",
                "Carry water and avoid long outdoor waiting where possible.",
            )
        )

    if not alerts:
        alerts.append(
            create_alert(
                "low",
                "Travel outlook looks suitable",
                "No major rain or strong-wind concern is detected at the destination.",
            )
        )

    if heavy_rain or strong_wind:
        recommendation = (
            "Travel is possible, but check local transport updates and keep extra time."
        )
    elif destination_current["temperature_c"] >= 35:
        recommendation = (
            "Travel conditions look acceptable, but plan hydration and avoid peak heat."
        )
    else:
        recommendation = (
            "Destination weather looks generally suitable for travel."
        )

    return alerts, recommendation


def compact_weather(weather: dict[str, Any]) -> dict[str, Any]:
    """
    Small shared weather shape used by Member 1's personalized homepage.
    """
    current = weather["current"]
    today = weather["next_days"][0]

    return {
        "temperature": current["temperature_c"],
        "humidity": current["humidity_percent"],
        "rainfall": current["rain_mm"],
        "wind_speed": current["wind_kmh"],
        "visibility": current["visibility_m"],
        "uv_index": today["max_uv_index"],
        "sunrise": today["sunrise"],
        "sunset": today["sunset"],
        "condition": current["condition"],
    }


def build_personalized_weather(
    role: str,
    weather: dict[str, Any],
    alerts: list[dict[str, str]],
    destination_weather: dict[str, Any] | None = None,
    travel_recommendation: str | None = None,
) -> dict[str, Any]:
    """
    Build only the important frontend data for each role.
    """
    current = compact_weather(weather)

    if role == "runner":
        return {
            "temperature": current["temperature"],
            "wind_speed": current["wind_speed"],
            "uv_index": current["uv_index"],
            "sunrise": current["sunrise"],
            "sunset": current["sunset"],
            "weather_alerts": alerts,
        }

    if role == "farmer":
        return {
            "temperature": current["temperature"],
            "humidity": current["humidity"],
            "rainfall": current["rainfall"],
            "weather_alerts": alerts,
        }

    if role == "commuter":
        return {
            "rainfall": current["rainfall"],
            "visibility": current["visibility"],
            "weather_alerts": alerts,
        }

    if destination_weather is None or travel_recommendation is None:
        raise WeatherServiceError("Traveller weather requires a destination.")

    destination = compact_weather(destination_weather)

    return {
        "current_location": {
            "temperature": current["temperature"],
            "humidity": current["humidity"],
            "rainfall": current["rainfall"],
            "wind_speed": current["wind_speed"],
        },
        "destination": {
            "place": destination_weather["location"]["name"],
            "temperature": destination["temperature"],
            "humidity": destination["humidity"],
            "rainfall": destination["rainfall"],
            "wind_speed": destination["wind_speed"],
            "sunrise": destination["sunrise"],
            "sunset": destination["sunset"],
        },
        "weather_alerts": alerts,
        "travel_recommendation": travel_recommendation,
    }


def get_personalized_widgets(role: str) -> list[dict[str, str]]:
    """Tell the frontend which cards should be prominent for each role."""
    widgets = {
        "runner": [
            {"id": "running_advice", "title": "Running Advice", "data": "personalized_weather"},
            {"id": "current_weather", "title": "Current Conditions", "data": "weather.current"},
            {"id": "hourly_forecast", "title": "Running Window", "data": "weather.next_hours"},
        ],
        "farmer": [
            {"id": "farm_alerts", "title": "Farm Alerts", "data": "alerts"},
            {"id": "soil_moisture", "title": "Surface Soil Moisture", "data": "weather.farmer_data"},
            {"id": "rain_forecast", "title": "Rain Forecast", "data": "weather.next_days"},
        ],
        "commuter": [
            {"id": "commute_alerts", "title": "Commute Alerts", "data": "alerts"},
            {"id": "current_weather", "title": "Current Weather", "data": "weather.current"},
            {"id": "hourly_forecast", "title": "Next Hours", "data": "weather.next_hours"},
        ],
        "traveller": [
            {"id": "travel_alerts", "title": "Travel Alerts", "data": "alerts"},
            {"id": "current_weather", "title": "Current Location", "data": "current_location.current"},
            {"id": "destination_weather", "title": "Destination Weather", "data": "destination.current"},
        ],
    }

    return widgets[role]


def get_personalized_homepage(
    location: str,
    role: str,
    destination: str | None = None,
) -> dict[str, Any]:
    """
    Main Member 2 function for Member 1's Flask backend.

    location: user's current location
    role: runner, farmer, commuter, or traveller
    destination: required only for traveller
    """
    selected_role = role.strip().lower()

    if selected_role not in ALLOWED_ROLES:
        valid_roles = ", ".join(sorted(ALLOWED_ROLES))
        raise WeatherServiceError(f"Unsupported role. Choose one of: {valid_roles}.")

    current_weather = get_weather_for_location(location)

    if selected_role == "runner":
        alerts = personalize_for_runner(current_weather)

    elif selected_role == "farmer":
        alerts = personalize_for_farmer(current_weather)

    elif selected_role == "commuter":
        alerts = personalize_for_commuter(current_weather)

    else:
        if not isinstance(destination, str) or not destination.strip():
            raise WeatherServiceError(
                "Destination is required when role is traveller."
            )

        destination_weather = get_weather_for_location(destination)
        alerts, travel_recommendation = personalize_for_traveller(
            current_weather,
            destination_weather,
        )

        return {
            "success": True,
            "role": selected_role,
            "generated_at": datetime.now().isoformat(timespec="seconds"),
            "alerts": alerts,
            "widgets": get_personalized_widgets(selected_role),
            "current_location": current_weather,
            "destination": destination_weather,
            "personalized_weather": build_personalized_weather(
                selected_role,
                current_weather,
                alerts,
                destination_weather,
                travel_recommendation,
            ),
        }

    return {
        "success": True,
        "role": selected_role,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "alerts": alerts,
        "widgets": get_personalized_widgets(selected_role),
        "weather": current_weather,
        "personalized_weather": build_personalized_weather(
            selected_role,
            current_weather,
            alerts,
        ),
    }