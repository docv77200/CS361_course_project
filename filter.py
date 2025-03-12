from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

ACTIVITIES_FILE = "activities.json"

# Load activities from JSON
def load_activities():
    if os.path.exists(ACTIVITIES_FILE):
        with open(ACTIVITIES_FILE, "r") as file:
            return json.load(file)["activities"]
    return []

@app.route("/filter-activities", methods=["POST"])
def filter_activities():
    data = request.json
    location = data.get("location", "").strip().lower()
    activity_type = data.get("activity_type", "").strip().lower()
    budget = data.get("budget", "").strip()

    activities = load_activities()
    filtered_activities = []

    for activity in activities:
        matches_location = not location or location in activity["location"].lower()
        matches_type = not activity_type or activity_type == "none" or activity_type == activity["type"].lower()
        
        # Convert budget to integer for comparison
        try:
            budget_value = int(budget) if budget.isdigit() else None
        except ValueError:
            budget_value = None  # If budget is invalid, ignore it

        matches_budget = not budget_value or activity["price"] <= budget_value

        if matches_location and matches_type and matches_budget:
            filtered_activities.append(activity)

    return jsonify({"success": True, "activities": filtered_activities})

if __name__ == "__main__":
    app.run(debug=True, port=6767)
