from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

REVIEWS_FILE = "reviews.json"

# Load reviews from JSON
def load_reviews():
    if os.path.exists(REVIEWS_FILE):
        with open(REVIEWS_FILE, "r") as file:
            return json.load(file)
    return {}

# Save reviews to JSON
def save_reviews(reviews):
    with open(REVIEWS_FILE, "w") as file:
        json.dump(reviews, file, indent=4)

# Get reviews for a specific activity
@app.route("/reviews/<activity_id>", methods=["GET"])
def get_reviews(activity_id):
    reviews = load_reviews()
    return jsonify(reviews.get(activity_id, []))

# Submit a new review
@app.route("/reviews", methods=["POST"])
def add_review():
    data = request.json
    activity_id = data.get("activity_id")
    username = data.get("username")
    rating = data.get("rating")
    comment = data.get("comment")

    if not activity_id or not username or not rating or not comment:
        return jsonify({"error": "Missing required fields"}), 400

    reviews = load_reviews()
    if activity_id not in reviews:
        reviews[activity_id] = []

    reviews[activity_id].append({
        "username": username,
        "rating": rating,
        "comment": comment
    })

    save_reviews(reviews)
    return jsonify({"success": True, "message": "Review added successfully!"})

if __name__ == "__main__":
    app.run(debug=True, port=5002)
