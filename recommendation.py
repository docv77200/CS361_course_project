from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

ACTIVITIES_FILE = "activities.json"
BOOKMARKS_FILE = "bookmarks.json"

# Load activities
def load_activities():
    if os.path.exists(ACTIVITIES_FILE):
        with open(ACTIVITIES_FILE, "r") as file:
            return json.load(file)["activities"]
    return []

# Load bookmarks
def load_bookmarks():
    if os.path.exists(BOOKMARKS_FILE):
        with open(BOOKMARKS_FILE, "r") as file:
            return json.load(file)
    return {}

@app.route("/recommendations/<username>", methods=["GET"])
def get_recommendations(username):
    activities = load_activities()
    bookmarks = load_bookmarks().get(username, [])

    if not bookmarks:
        return jsonify({"message": "No bookmarks found. Try bookmarking activities to get recommendations."})

    # Find similar activities based on bookmarked ones
    bookmarked_activities = [activity for activity in activities if activity["id"] in bookmarks]

    recommended_activities = []
    for activity in activities:
        if activity["id"] not in bookmarks:
            for bookmarked in bookmarked_activities:
                if activity["type"] == bookmarked["type"] and activity["location"] == bookmarked["location"]:
                    recommended_activities.append(activity)
                    break  # Avoid duplicates

    return jsonify(recommended_activities[:5])  # Limit to 5 recommendations

if __name__ == "__main__":
    app.run(debug=True, port=5003)
