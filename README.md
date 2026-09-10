# Mausam — Personalized Weather Homepage

## SIH 2026 Project

**Problem Statement:** SIH26076 — Development of personalized homepage for the **Mausam** mobile application.

Mausam is a personalized weather application that provides weather information and role-based recommendations for different users such as runners, farmers, commuters, and travellers.

---

## My Contribution — Member 1: Python & Backend Developer

I worked as **Member 1 (Python & Backend Developer)**.

### Responsibilities completed

- Developed the Flask backend and REST API routes.
- Implemented the `/api/personalize` POST API for frontend-backend communication.
- Implemented request validation for user role, location, and traveller destination.
- Integrated the backend with the weather service developed for the project.
- Connected the backend with SQLite for storing user preferences.
- Implemented support for four user roles:
  - Runner
  - Farmer
  - Commuter
  - Traveller
- Connected traveller requests with destination weather information.
- Added backend error handling and HTTP status responses.
- Tested the API using Python `requests`.
- Prepared the backend for integration with the Mausam frontend.

---

## Backend Architecture

```text
Frontend
   |
   | JSON POST request
   v
Flask Backend (app.py)
   |
   +----> SQLite Database (database.py)
   |
   +----> Weather Service (weather_service.py)
              |
              +----> Open-Meteo Geocoding API
              |
              +----> Open-Meteo Weather API
```

---

## API Endpoints

### 1. Health Check

**GET**

```text
/api/health
```

Example response:

```json
{
  "status": "success",
  "message": "Backend is working"
}
```

---

### 2. Personalized Homepage

**POST**

```text
/api/personalize
```

The frontend sends the user's role and location to the backend.

#### Runner

Request:

```json
{
  "role": "runner",
  "location": "Bengaluru"
}
```

#### Farmer

Request:

```json
{
  "role": "farmer",
  "location": "Davangere"
}
```

#### Commuter

Request:

```json
{
  "role": "commuter",
  "location": "Bengaluru"
}
```

#### Traveller

Request:

```json
{
  "role": "traveller",
  "location": "Bengaluru",
  "destination": "Goa, Goa"
}
```

The backend returns personalized weather information, alerts, recommendations, widgets, and a generated user ID.

---

## Database

SQLite is used to store basic user preferences.

### `users` table

| Field | Description |
|---|---|
| `id` | Unique user ID |
| `location` | Current location |
| `role` | User persona |
| `destination` | Traveller destination, if applicable |

The database is initialized automatically when the Flask application starts.

---

## Technologies Used

- Python
- Flask
- REST API
- JSON
- SQLite
- Requests
- Open-Meteo Weather API
- Open-Meteo Geocoding API
- Git & GitHub

---

## Project Structure

```text
SIH26076-Mausam/
│
├── app.py                  # Flask application and API routes
├── database.py             # SQLite database operations
├── weather_service.py      # Weather API and personalization service
├── test_api.py             # API testing script
├── check_database.py       # Database verification script
├── .gitignore              # Git ignored files
└── README.md               # Project documentation
```

> `mausam.db`, `venv/`, and Python cache files are intentionally excluded from Git using `.gitignore`.

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Srujan111-max/SIH26076-Mausam.git
cd SIH26076-Mausam
```

### 2. Create a virtual environment

Windows:

```powershell
python -m venv venv
```

### 3. Activate the virtual environment

PowerShell:

```powershell
venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```powershell
pip install flask requests
```

### 5. Run the backend

```powershell
python app.py
```

The backend will run at:

```text
http://127.0.0.1:5000
```

### 6. Test the API

In another terminal, with the virtual environment activated:

```powershell
python test_api.py
```

---

## Team Structure

| Member | Role | Main Responsibility |
|---|---|---|
| Member 1 | Python & Backend Developer | Flask backend, APIs, SQLite, personalization integration |
| Member 2 | API & Backend | Weather API and weather-data services |
| Member 3 | Frontend Developer | Frontend application and backend integration |
| Member 4 | UI/UX Designer | User interface and user experience |
| Member 5 | Research & Documentation | Research, documentation and presentation |
| Member 6 | Testing & Integration | Testing, debugging and final integration |

---

## Project Goal

The goal of Mausam is to move beyond displaying generic weather information by providing a **personalized weather homepage** based on the user's needs and activities.

For example:

- **Runner:** running conditions, UV information and suitable activity periods.
- **Farmer:** rainfall, humidity and agricultural weather alerts.
- **Commuter:** rain, visibility and commuting alerts.
- **Traveller:** current-location weather combined with destination weather and travel recommendations.

---

## Backend Status

The core Member 1 backend implementation is complete and tested with all four supported user roles.

**SIH 2026 — SIH26076**
