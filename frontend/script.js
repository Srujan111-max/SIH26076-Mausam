let selectedRole = null;

const roleButtons = document.querySelectorAll(".role-btn");
const locationInput = document.getElementById("location");
const destinationContainer = document.getElementById("destination-container");
const destinationInput = document.getElementById("destination");

const getWeatherButton = document.getElementById("get-weather");

const loading = document.getElementById("loading");
const error = document.getElementById("error");
const result = document.getElementById("result");
const weatherContent = document.getElementById("weather-content");


/* -------------------------------
   ROLE SELECTION
-------------------------------- */

roleButtons.forEach(button => {

    button.addEventListener("click", () => {

        roleButtons.forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedRole = button.dataset.role;

        if (selectedRole === "traveller") {
            destinationContainer.classList.remove("hidden");
        } else {
            destinationContainer.classList.add("hidden");
            destinationInput.value = "";
        }
    });
});


/* -------------------------------
   GET PERSONALIZED WEATHER
-------------------------------- */

getWeatherButton.addEventListener("click", async (event) => {
    event.preventDefault();
    error.classList.add("hidden");
    result.classList.add("hidden");

    if (!selectedRole) {
        showError("Please select a role.");
        return;
    }

    const location = locationInput.value.trim();

    if (!location) {
        showError("Please enter your current location.");
        return;
    }

    const destination = destinationInput.value.trim();

    if (selectedRole === "traveller" && !destination) {
        showError("Please enter your destination.");
        return;
    }

    const requestData = {
        role: selectedRole,
        location: location
    };

    if (selectedRole === "traveller") {
        requestData.destination = destination;
    }

    loading.classList.remove("hidden");

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/personalize",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(requestData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Backend request failed.");
        }

        displayWeather(data);

    } catch (err) {

        showError(
            "Unable to get weather data. Make sure the Flask backend is running."
        );

        console.error(err);

    } finally {

        loading.classList.add("hidden");

    }
});


/* -------------------------------
   DISPLAY WEATHER
-------------------------------- */

function displayWeather(data) {

    result.classList.remove("hidden");

    let html = "";

    /* =========================================
       ROLE
    ========================================= */

    html += `
        <div class="result-header">
            <div>
                <span class="result-label">Personalized for</span>
                <h3>${capitalize(data.role || selectedRole)}</h3>
            </div>
        </div>
    `;


    /* =========================================
       TRAVELLER
    ========================================= */

    if (data.role === "traveller") {

        const current = data.current_location?.current;
        const currentLocation = data.current_location?.location;

        const destination = data.destination?.current;
        const destinationLocation = data.destination?.location;

        const travelInfo = data.personalized_weather;

        /* Current location + destination */

        html += `
            <div class="location-route">

                <div class="location-box">
                    <span class="location-label">CURRENT LOCATION</span>
                    <strong>
                        ${currentLocation?.name || "Current Location"}
                    </strong>
                    <small>
                        ${currentLocation?.state || ""}
                        ${currentLocation?.country ? ", " + currentLocation.country : ""}
                    </small>
                </div>

                <div class="route-arrow">→</div>

                <div class="location-box destination-box">
                    <span class="location-label">DESTINATION</span>
                    <strong>
                        ${destinationLocation?.name || travelInfo?.destination?.place || "Destination"}
                    </strong>
                    <small>
                        ${destinationLocation?.state || ""}
                        ${destinationLocation?.country ? ", " + destinationLocation.country : ""}
                    </small>
                </div>

            </div>
        `;


        /* Current weather */

        if (current) {

            html += `
                <div class="section-title">
                    <span>📍</span>
                    Current Location Weather
                </div>

                <div class="weather-grid traveller-grid">

                    ${createWeatherItem(
                        "Temperature",
                        current.temperature_c,
                        "°C"
                    )}

                    ${createWeatherItem(
                        "Feels Like",
                        current.feels_like_c,
                        "°C"
                    )}

                    ${createWeatherItem(
                        "Humidity",
                        current.humidity_percent,
                        "%"
                    )}

                    ${createWeatherItem(
                        "Rainfall",
                        current.rain_mm,
                        " mm"
                    )}

                    ${createWeatherItem(
                        "Wind Speed",
                        current.wind_kmh,
                        " km/h"
                    )}

                    ${createWeatherItem(
                        "Visibility",
                        (current.visibility_m / 1000).toFixed(1),
                        " km"
                    )}

                </div>
            `;
        }


        /* Destination weather */

        if (destination) {

            html += `
                <div class="section-title">
                    <span>✈️</span>
                    Destination Weather
                </div>

                <div class="weather-grid traveller-grid">

                    ${createWeatherItem(
                        "Temperature",
                        destination.temperature_c,
                        "°C"
                    )}

                    ${createWeatherItem(
                        "Feels Like",
                        destination.feels_like_c,
                        "°C"
                    )}

                    ${createWeatherItem(
                        "Humidity",
                        destination.humidity_percent,
                        "%"
                    )}

                    ${createWeatherItem(
                        "Rainfall",
                        destination.rain_mm,
                        " mm"
                    )}

                    ${createWeatherItem(
                        "Wind Speed",
                        destination.wind_kmh,
                        " km/h"
                    )}

                    ${createWeatherItem(
                        "Visibility",
                        (destination.visibility_m / 1000).toFixed(1),
                        " km"
                    )}

                </div>
            `;
        }


        /* Travel recommendation */

        if (travelInfo?.travel_recommendation) {

            html += `
                <div class="travel-recommendation">

                    <div class="recommendation-icon">✈️</div>

                    <div>
                        <strong>Travel Recommendation</strong>

                        <p>
                            ${travelInfo.travel_recommendation}
                        </p>
                    </div>

                </div>
            `;
        }


        /* Travel alerts */

        if (data.alerts && data.alerts.length > 0) {

            html += `
                <div class="alert">

                    <strong>⚠ Travel Alerts</strong>

                    <ul>
                        ${data.alerts.map(alert => {

                            if (typeof alert === "object") {

                                return `
                                    <li>
                                        <strong>
                                            ${alert.title || "Travel Alert"}
                                        </strong>
                                        <br>
                                        ${alert.message || ""}
                                    </li>
                                `;
                            }

                            return `<li>${alert}</li>`;

                        }).join("")}
                    </ul>

                </div>
            `;
        }


        /* Destination forecast */

        if (data.destination?.next_days?.length > 0) {

            html += `
                <div class="recommendation">

                    <strong>Destination Forecast</strong>

                    <ul>

                        ${data.destination.next_days.map(day => {

                            const date = new Date(day.date);

                            const formattedDate =
                                date.toLocaleDateString([], {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric"
                                });

                            return `
                                <li>

                                    <span>
                                        <strong>${formattedDate}</strong>
                                        &nbsp; ${day.condition}
                                    </span>

                                    <span>
                                        ${day.min_temperature_c}°–
                                        ${day.max_temperature_c}°C
                                        &nbsp; • &nbsp;
                                        Rain ${day.max_rain_probability_percent}%
                                    </span>

                                </li>
                            `;

                        }).join("")}

                    </ul>

                </div>
            `;
        }


        weatherContent.innerHTML = html;

        return;
    }


    /* =========================================
       RUNNER / FARMER / COMMUTER
    ========================================= */

    const current = data.weather?.current;
    const personalized = data.personalized_weather;
    const location = data.weather?.location;


    /* Location */

    if (location) {

        html += `
            <div class="location-banner">

                <span>📍</span>

                <div>
                    <strong>${location.name}</strong>
                    <small>
                        ${location.state}, ${location.country}
                    </small>
                </div>

            </div>
        `;
    }


    /* Weather cards */

    if (current) {

        html += `
            <div class="weather-grid">

                ${createWeatherItem(
                    "Temperature",
                    current.temperature_c,
                    "°C"
                )}

                ${createWeatherItem(
                    "Feels Like",
                    current.feels_like_c,
                    "°C"
                )}

                ${createWeatherItem(
                    "Humidity",
                    current.humidity_percent,
                    "%"
                )}

                ${createWeatherItem(
                    "Rainfall",
                    current.rain_mm,
                    " mm"
                )}

                ${createWeatherItem(
                    "Wind Speed",
                    current.wind_kmh,
                    " km/h"
                )}

                ${createWeatherItem(
                    "Visibility",
                    (current.visibility_m / 1000).toFixed(1),
                    " km"
                )}

                ${personalized?.uv_index !== undefined
                    ? createWeatherItem(
                        "UV Index",
                        personalized.uv_index,
                        ""
                    )
                    : ""
                }

            </div>
        `;
    }


    /* Alerts */

    if (data.alerts && data.alerts.length > 0) {

        html += `
            <div class="alert">

                <strong>⚠ Weather Alerts</strong>

                <ul>

                    ${data.alerts.map(alert => {

                        if (typeof alert === "object") {

                            return `
                                <li>
                                    <strong>
                                        ${alert.title || "Weather Alert"}
                                    </strong>
                                    <br>
                                    ${alert.message || ""}
                                </li>
                            `;
                        }

                        return `<li>${alert}</li>`;

                    }).join("")}

                </ul>

            </div>
        `;
    }


    /* Upcoming hours */

    if (data.weather?.next_hours?.length > 0) {

        html += `
            <div class="recommendation">

                <strong>Upcoming Hours</strong>

                <ul>

                    ${data.weather.next_hours.map(hour => {

                        const date = new Date(hour.time);

                        const time =
                            date.toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit"
                            });

                        return `
                            <li>

                                <span>
                                    <strong>${time}</strong>
                                    &nbsp; ${hour.condition}
                                </span>

                                <span>
                                    ${hour.temperature_c}°C
                                    &nbsp; • &nbsp;
                                    Rain ${hour.rain_probability_percent}%
                                </span>

                            </li>
                        `;

                    }).join("")}

                </ul>

            </div>
        `;
    }


    weatherContent.innerHTML = html;
}


/* =========================================
   CAPITALIZE ROLE
========================================= */

function capitalize(text) {

    if (!text) return "";

    return text.charAt(0).toUpperCase() + text.slice(1);
}

/* -------------------------------
   WEATHER ITEM
-------------------------------- */

function createWeatherItem(label, value, unit) {

    if (value === undefined || value === null) {
        return "";
    }

    return `
        <div class="weather-item">
            <strong>${label}</strong>
            <p>${value}${unit}</p>
        </div>
    `;
}


/* -------------------------------
   ERROR
-------------------------------- */

function showError(message) {

    error.textContent = message;
    error.classList.remove("hidden");

}