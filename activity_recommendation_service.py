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

    # Extract user inputs
    user_location = data.get("location", "").strip().lower()
    user_interests_raw = data.get("activity_type", "").strip().lower()
    
    # Ensure we split properly even if input is empty
    user_interests = set(user_interests_raw.split(", ")) if user_interests_raw else set()

    print(f"📩 Received Recommendation Request: Location = {user_location}, Interests = {user_interests}")

    activities = load_activities()
    scored_activities = []

    for activity in activities:
        score = 0
        activity_location = activity["location"].strip().lower()
        activity_type = activity["type"].strip().lower()
        activity_description = activity["description"].strip().lower()

        # Debug: Print out the activity details
        print(f"🔍 Checking Activity: {activity['name']} | Location: {activity_location} | Type: {activity_type}")

        # ✅ 1️⃣ Ensure ALL same-location activities are included
        if activity_location == user_location:
            score += 3  # Strongest weight for same city
        elif user_location in activity_location:
            score += 2  # Partial match

        # ✅ 2️⃣ If interest matches, boost the score
        if any(interest in activity_type for interest in user_interests) or \
           any(interest in activity_description for interest in user_interests):
            score += 1  # Extra boost for interest match

        # Debugging: Print score assigned to each activity
        print(f"🟢 Activity: {activity['name']} | Score: {score}")

        # ✅ Always keep same-location activities, even if interest score is 0
        if score > 0 or activity_location == user_location:
            scored_activities.append((score, activity))

    # ✅ Sort by score, highest first
    scored_activities.sort(reverse=True, key=lambda x: x[0])
    sorted_activities = [activity for _, activity in scored_activities]  

    print(f"✅ Returning {len(sorted_activities)} Activities (Sorted).")

    return jsonify(sorted_activities)  # Return the sorted list

if __name__ == '__main__':
    app.run(debug=True, port=6767)
