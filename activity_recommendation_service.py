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

        # Debugging: Print each activity's details
        print(f"🔍 Checking Activity: {activity['name']} | Location: {activity_location} | Type: {activity_type}")

        # Location match (Higher weight)
        if activity_location == user_location:
            score += 2  
        elif user_location in activity_location:
            score += 1  

        # Interest match (Lower weight)
        if any(interest in activity_type for interest in user_interests):
            score += 1  

        # Append activity with score (even if score is 0)
        scored_activities.append((score, activity))

    # Sort activities by highest score but return all
    scored_activities.sort(reverse=True, key=lambda x: x[0])
    sorted_activities = [activity for _, activity in scored_activities]

    print(f"✅ Returning {len(sorted_activities)} Activities (Sorted).")

    return jsonify(sorted_activities)  # Return full list, sorted

if __name__ == '__main__':
    app.run(debug=True, port=6767)
