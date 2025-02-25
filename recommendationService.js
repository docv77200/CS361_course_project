const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data');

// Function to load user data
function loadUserData() {
    try {
        return JSON.parse(fs.readFileSync(path.join(dataPath, 'user.json'), 'utf-8'));
    } catch (error) {
        console.error('Error loading user.json:', error);
        return null;
    }
}

// Function to load activities data
function loadActivityData() {
    try {
        return JSON.parse(fs.readFileSync(path.join(dataPath, 'activities.json'), 'utf-8')).activities;
    } catch (error) {
        console.error('Error loading activities.json:', error);
        return [];
    }
}

// Function to generate recommendations based on interests & location
function getRecommendedActivities() {
    const user = loadUserData();
    if (!user) return [];

    const allActivities = loadActivityData();
    const userInterests = user.interests || [];
    const userLocation = user.city || "";

    // Sorting activities based on relevance
    const sortedActivities = allActivities.sort((a, b) => {
        const aMatchesInterest = userInterests.includes(a.type);
        const bMatchesInterest = userInterests.includes(b.type);
        const aMatchesLocation = a.location === userLocation;
        const bMatchesLocation = b.location === userLocation;

        // Priority logic
        if (aMatchesInterest && aMatchesLocation && !(bMatchesInterest && bMatchesLocation)) return -1;
        if (!(aMatchesInterest && aMatchesLocation) && bMatchesInterest && bMatchesLocation) return 1;

        if (aMatchesInterest && !bMatchesInterest) return -1;
        if (!aMatchesInterest && bMatchesInterest) return 1;

        if (aMatchesLocation && !bMatchesLocation) return -1;
        if (!aMatchesLocation && bMatchesLocation) return 1;

        return 0;
    });

    return sortedActivities;
}

// Export function
module.exports = { getRecommendedActivities };
