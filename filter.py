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
    try:
        data = request.json

        # Extract filters (handle missing values properly)
        location = str(data.get("location", "")).strip().lower()
        activity_type = str(data.get("activity_type", "")).strip().lower()
        budget = str(data.get("budget", "")).strip()

        activities = load_activities()
        filtered_activities = []

        for activity in activities:
            # Convert activity data to lowercase for case-insensitive matching
            activity_location = activity["location"].strip().lower()
            activity_type_value = activity["type"].strip().lower()
            activity_price = activity["price"]

            # Default to True so missing filters don't remove results
            matches_location = True if not location else location in activity_location
            matches_type = True if not activity_type or activity_type == "none" else activity_type == activity_type_value

            # Convert budget to int and apply filter if it's provided
            try:
                budget_value = int(budget) if budget.isdigit() else None
            except ValueError:
                budget_value = None  # If budget is invalid, ignore it

            matches_budget = True if budget_value is None else activity_price <= budget_value

            # If activity passes all applied filters, add it to results
            if matches_location and matches_type and matches_budget:
                filtered_activities.append(activity)

        print(f"✅ Found {len(filtered_activities)} matching activities.")
        return jsonify({"success": True, "activities": filtered_activities})

    except Exception as e:
        print(f"❌ Error in filter-activities: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=6767)
