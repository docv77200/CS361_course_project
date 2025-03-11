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

# Get the average rating for an activity
@app.route("/reviews/<activity_id>", methods=["GET"])
def get_reviews(activity_id):
    reviews = load_reviews()
    ratings = reviews.get(activity_id, [])

    if not ratings:
        return jsonify({"average_rating": 0, "total_reviews": 0})

    avg_rating = sum(ratings) / len(ratings)
    return jsonify({"average_rating": round(avg_rating, 1), "total_reviews": len(ratings)})

# Submit a new star rating
@app.route("/reviews", methods=["POST"])
def add_review():
    data = request.json
    activity_id = data.get("activity_id")
    rating = data.get("rating")

    if not activity_id or rating not in [1, 2, 3, 4, 5]:
        return jsonify({"error": "Invalid rating"}), 400

    reviews = load_reviews()
    if activity_id not in reviews:
        reviews[activity_id] = []

    reviews[activity_id].append(rating)
    save_reviews(reviews)

    return jsonify({"success": True, "message": "Rating submitted successfully!"})

if __name__ == "__main__":
    app.run(debug=True, port=5002)
