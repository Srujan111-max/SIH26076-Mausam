from database import init_database, save_user
from flask import Flask, request, jsonify

from weather_service import (
    get_personalized_homepage,
    WeatherServiceError
)


app = Flask(__name__)

init_database()


@app.route("/")
def home():
    return "Mausam Backend is Running!"


@app.route("/api/health")
def health():
    return jsonify({
        "status": "success",
        "message": "Backend is working"
    })


@app.route("/api/personalize", methods=["POST"])
def personalize():

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "No JSON data received"
        }), 400

    role = data.get("role")
    current_location = data.get("location")
    destination = data.get("destination")

    if not role:
        return jsonify({
            "status": "error",
            "message": "Role is required"
        }), 400

    if not current_location:
        return jsonify({
            "status": "error",
            "message": "Location is required"
        }), 400

    role = role.lower()

    # Traveller requires destination
    if role == "traveller" and not destination:
        return jsonify({
            "status": "error",
            "message": "Destination is required for traveller"
        }), 400

    # Save user's personalization choice in SQLite
    user_id = save_user(
        location=current_location,
        role=role,
        destination=destination
    )

    try:

        # Get personalized weather from Member 2's weather service
        result = get_personalized_homepage(
            location=current_location,
            role=role,
            destination=destination
        )

        # Add database user ID
        result["user_id"] = user_id

        # Keep API status compatible with our existing backend
        result["status"] = "success"

        return jsonify(result)

    except WeatherServiceError as error:

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 400

    except Exception as error:

        return jsonify({
            "status": "error",
            "message": "Unexpected backend error",
            "details": str(error)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)