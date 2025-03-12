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

    activities = load_activities()
    scored_activities = []

    for activity in activities:
        score = 0
        activity_location = activity["location"].strip().lower()
        activity_type = activity["type"].strip().lower()

        # Location match (Higher weight)
        if activity_location == user_location:
            score += 2  
        elif user_location in activity_location:
            score += 1  

        # Interest match (Lower weight)
        if activity_type in user_interests:
            score += 1  

        # Append activity with score
        scored_activities.append((score, activity))

    # Sort activities by highest score first
    scored_activities.sort(reverse=True, key=lambda x: x[0])

    # Return sorted activity list
    sorted_activities = [activity for _, activity in scored_activities]

    return jsonify(sorted_activities)

if __name__ == '__main__':
    app.run(debug=True, port=6767)
