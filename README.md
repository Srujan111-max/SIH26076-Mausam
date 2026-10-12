# Mausam — Personalized Weather Homepage

## SIH 2026 Project

**Problem Statement:** SIH26076 — Development of personalized homepage for the **Mausam** mobile application.

Mausam is a personalized weather application that provides weather information, forecasts, alerts, insights, and role-based recommendations for runners, farmers, commuters, and travellers.

### Supported Personas
- Runner
- Farmer
- Commuter
- Traveller

The project consists of a React/Vite frontend and a Flask/Python backend. Open-Meteo services are used for geocoding, weather, and air-quality data.

---

## My Contribution — Member 1

I worked as **Member 1 — Python & Backend Developer**.

### Responsibilities
- Developed Flask backend and REST APIs.
- Implemented `/api/health` and `/api/personalize`.
- Added request validation and error handling.
- Integrated SQLite for user preferences.
- Implemented four user personas.
- Implemented dynamic user-selected locations.
- Integrated Open-Meteo Geocoding API.
- Integrated Open-Meteo Weather API.
- Integrated Open-Meteo Air Quality API.
- Added current weather and forecast information.
- Added rain probability, UV, visibility, sunrise, and sunset.
- Added AQI, PM2.5, PM10, nitrogen dioxide, and ozone.
- Implemented traveller current-location and destination weather.
- Added destination forecasts and travel information.
- Implemented persona-specific recommendations.
- Added weather alerts and insights.
- Tested APIs using Python `requests`.
- Integrated Flask backend with React/Vite frontend.
- Tested all four persona flows.

---

## Key Features

### Current Weather
Provides temperature, feels-like temperature, humidity, wind, visibility, weather condition, rain probability, UV index, sunrise, and sunset.

### Air Quality
Provides US AQI, PM2.5, PM10, nitrogen dioxide, and ozone.

### Forecasts
Provides hourly and multi-day weather forecasts.

### Dynamic Locations
Users can enter their preferred location instead of depending on a fixed city.

### Personalization
Weather conditions are processed according to the selected persona using primarily rule-based logic.

### Traveller Support
Travellers can provide both current location and destination. The system retrieves weather and forecast information for both.

### Alerts and Insights
Provides persona-related weather alerts, insights, and recommendations.

---

## Backend API

**Base URL:** `http://127.0.0.1:5000`

### Health Check

```text
GET /api/health
```

Example response:

```json
{
  "status": "success",
  "message": "Backend is working"
}
```

### Personalized Homepage

```text
POST /api/personalize
```

Example request:

```json
{
  "role": "runner",
  "location": "Mysuru"
}
```

Traveller request:

```json
{
  "role": "traveller",
  "location": "Mumbai",
  "destination": "Delhi"
}
```

The API returns personalized weather data, forecasts, recommendations, alerts, and insights.

---

## Database

The project uses **SQLite** for basic user preference storage.

Stored information includes:
- User ID
- Location
- Role
- Destination

Database logic is implemented in `database.py`.

---

## Weather Service

Weather processing is implemented in `weather_service.py`.

It handles:
- Location geocoding
- Current weather
- Hourly forecast
- Multi-day forecast
- Air quality
- Persona-specific processing
- Recommendations
- Alerts
- Insights

---

## External APIs

### Open-Meteo Geocoding API
Converts location names into geographic coordinates.

### Open-Meteo Weather API
Provides current weather, hourly forecasts, daily forecasts, rain probability, UV, sunrise, sunset, and visibility.

### Open-Meteo Air Quality API
Provides AQI and pollutant information.

---

## Frontend

The frontend is built using:
- React
- Vite
- TypeScript

Important frontend files:

```text
src/lib/mausam/api.ts
src/lib/mausam/types.ts
src/routes/dashboard.tsx
src/routes/preferences.$role.tsx
```

The frontend communicates with the Flask backend through `/api/personalize`.

---

## Project Structure

```text
SIH26076-Mausam/
├── app.py
├── database.py
├── weather_service.py
├── test_api.py
├── check_database.py
├── README.md
└── mausam-persona-builder-main/
    └── mausam-persona-builder-main/
        ├── package.json
        └── src/
            ├── lib/mausam/
            └── routes/
```

---

## Technologies Used

**Backend**
- Python
- Flask
- Flask-CORS
- SQLite
- Requests
- REST API

**Frontend**
- React
- Vite
- TypeScript

**APIs**
- Open-Meteo Geocoding API
- Open-Meteo Weather API
- Open-Meteo Air Quality API

**Tools**
- Visual Studio Code
- Git
- GitHub
- PowerShell

---

## Setup

### Backend

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install flask flask-cors requests
python app.py
```

Backend runs at:

```text
http://127.0.0.1:5000
```

### Frontend

Navigate to:

```text
mausam-persona-builder-main\mausam-persona-builder-main
```

Then run:

```powershell
npm install
npm run dev
```

---

## Testing

The backend was tested using Python `requests`.

Testing covered:
- Runner
- Farmer
- Commuter
- Traveller
- Dynamic locations
- Current weather
- Hourly forecasts
- Multi-day forecasts
- Air quality
- Rain probability
- UV
- Sunrise and sunset
- Traveller destination weather
- Alerts
- Insights
- Frontend-backend communication

Example:

```python
import requests

url = "http://127.0.0.1:5000/api/personalize"
data = {"role": "runner", "location": "Mysuru"}

response = requests.post(url, json=data)

print(response.status_code)
print(response.json())
```

---

## Current Project Status

The core Mausam personalization system is implemented and integrated.

### Completed
- Flask backend
- REST APIs
- SQLite integration
- Open-Meteo integration
- Dynamic locations
- Four personas
- Current weather
- Hourly and multi-day forecasts
- Air quality and AQI
- PM2.5 and PM10
- UV index
- Rain probability
- Sunrise and sunset
- Traveller destination weather
- Persona-specific recommendations
- Alerts and insights
- React/Vite integration
- End-to-end testing

---

## Limitations

- Location is currently entered by the user rather than obtained through GPS.
- Personalization is primarily rule-based.
- The current project runs locally.
- Advanced ML personalization is not currently implemented.
- Weather data depends on external Open-Meteo services.

---

## Future Enhancements

- GPS-based location detection
- User authentication
- Machine-learning-based personalization
- Historical weather analysis
- Weather trend prediction
- Advanced agricultural recommendations
- Push notifications
- Cloud deployment
- Mobile application integration

---

## Team Structure

| Member | Role |
|---|---|
| Member 1 | Python & Backend Developer |
| Member 2 | API & Backend |
| Member 3 | Frontend Developer |
| Member 4 | UI/UX Designer |
| Member 5 | Research & Documentation |
| Member 6 | Testing & Integration |

---

## Project Goal

The goal of Mausam is to transform general weather information into **useful, personalized weather guidance**.

| Persona | Focus |
|---|---|
| Runner | Running Conditions |
| Farmer | Farm Weather Guidance |
| Commuter | Commute Conditions |
| Traveller | Travel Outlook |

The current system uses rule-based personalization and can be extended with machine-learning techniques in future versions.

---

## Project Identification

**Smart India Hackathon 2026**

**Problem Statement:** SIH26076

**Project:** Mausam — Personalized Weather Homepage

**Member 1:** Python & Backend Developer

**Repository:** `Srujan111-max/SIH26076-Mausam`

---

**SIH 2026 — SIH26076**
