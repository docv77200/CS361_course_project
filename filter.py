from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

ACTIVITIES_FILE = "activities.json"

# Load activities
def load_activities():
    if os.path.exists(ACTIVITIES_FILE):
        with open(ACTIVITIES_FILE, "r") as file:
            return json.load(file)["activities"]
    return []

@app.route("/recommendations", methods=["POST"])
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
        
        # Convert budget to int and match with activity price
        if budget and budget != "None":
            try:
                budget_value = int(budget.replace("$", ""))
                matches_budget = activity["price"] <= budget_value
            except ValueError:
                return jsonify({"error": "Invalid budget format"}), 400
        else:
            matches_budget = True  # Ignore budget filter if not set

        if matches_location and matches_type and matches_budget:
            filtered_activities.append(activity)

    return jsonify(filtered_activities)

if __name__ == "__main__":
    app.run(debug=True, port=6767)
