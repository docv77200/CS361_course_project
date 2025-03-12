from flask import Flask, request, jsonify
import json

app = Flask(__name__)

def load_activity_data():
    """Load activity data from the JSON file."""
    try:
        with open('data/activities.json', 'r', encoding='utf-8') as file:
            return json.load(file)['activities']
    except Exception as e:
        print(f"Error loading activity data: {e}")
        return []

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    """Filter activities based on user-selected filters."""
    data = request.json
    location = data.get('location', '').strip()
    activity_type = data.get('activity_type', '').strip()
    budget = data.get('budget', '').strip()

    try:
        activities = load_activity_data()
        filtered_activities = []

        for activity in activities:
            if location and activity['location'].lower() != location.lower():
                continue
            if activity_type and activity['type'].lower() != activity_type.lower():
                continue
            if budget:
                try:
                    budget_value = int(budget.replace('$', ''))
                    if activity['price'] > budget_value:
                        continue
                except ValueError:
                    print("Invalid budget format")

            filtered_activities.append(activity)

        if not filtered_activities:
            return jsonify({"message": "No activities match your filters.", "activities": []}), 200

        return jsonify(filtered_activities), 200
    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6767, debug=True)
