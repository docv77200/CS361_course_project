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

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    data = request.json

    user_location = data.get("location", "").strip().lower()
    user_interests = set(map(str.lower, data.get("activity_type", "").split(", ")))

    print(f"📩 Received Recommendation Request: Location = {user_location}, Interests = {user_interests}")

    activities = load_activities()
    scored_activities = []

    for activity in activities:
        score = 0
        activity_location = activity["location"].strip().lower()
        activity_type = activity["type"].strip().lower()
        activity_description = activity["description"].strip().lower()

        # Debugging: Print each activity's details
        print(f"🔍 Checking Activity: {activity['name']} | Location: {activity_location} | Type: {activity_type}")

        # ✅ 1️⃣ Always Prioritize Location Matches
        if activity_location == user_location:
            score += 3  # Strong priority for same-city activities
        elif user_location in activity_location:
            score += 2  # Partial match

        # ✅ 2️⃣ Then Check Interest Matches
        if any(interest in activity_type for interest in user_interests) or \
           any(interest in activity_description for interest in user_interests):
            score += 1  # Interest match boosts score but is secondary to location

        # Append activity with score
        scored_activities.append((score, activity))

    # ✅ 3️⃣ Sort activities by highest score (location-based sorting is guaranteed)
    scored_activities.sort(reverse=True, key=lambda x: x[0])
    sorted_activities = [activity for score, activity in scored_activities]  # Include all scored activities

    print(f"✅ Returning {len(sorted_activities)} Activities (Sorted).")

    return jsonify(sorted_activities)  # Return full list, sorted

if __name__ == '__main__':
    app.run(debug=True, port=6767)
