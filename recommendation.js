const axios = require('axios');

async function fetchRecommendations(city, interests, budget = "$50") {
    try {
        const response = await axios.post('http://127.0.0.1:6767/recommendations', {
            location: city,
            activity_type: interests,
            budget
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return [];
    }
}

module.exports = { fetchRecommendations };
