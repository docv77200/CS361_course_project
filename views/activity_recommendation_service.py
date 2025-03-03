# Sends data (microservice)

from flask import Flask, request, jsonify

app = Flask(__name__)

# Sample database of activities
activities = [
    {"name": "Ice Skating at Holiday Park", "description": "Enjoy outdoor skating with holiday decorations.", "price": 15, "distance": 2.5, "type": "outdoor", "location": "New York"},
    {"name": "Coffee Tasting Tour", "description": "Explore local coffee roasters and sample different blends.", "price": 25, "distance": 1.8, "type": "food & drink", "location": "Los Angeles"},
    {"name": "Hiking Adventure", "description": "Scenic hiking trails for all levels.", "price": 0, "distance": 5.0, "type": "outdoor", "location": "Denver"},
    {"name": "Local Brewery Tour", "description": "Discover the city's best local breweries and enjoy tastings.", "price": 30, "distance": 3.5, "type": "food & drink", "location": "Los Angeles"},
    {"name": "Holiday Light Show", "description": "Experience a magical holiday light display.", "price": 10, "distance": 1.2, "type": "relaxation", "location": "New York"}
]

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    data = request.json
    location = data.get("location")
    activity_type = data.get("activity_type")
    budget = data.get("budget")

    # Filter activities based on user input
    filtered_activities = [activity for activity in activities
                            if (location.lower() in activity["location"].lower()) and
                               (activity_type.lower() in activity["type"].lower()) and
                               (activity["price"] <= int(budget.replace('$', '').split('-')[0]))]

    return jsonify(filtered_activities)

if __name__ == '__main__':
    app.run(debug=True, port=6767)
