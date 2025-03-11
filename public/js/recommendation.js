document.addEventListener("DOMContentLoaded", () => {
    const recommendationGrid = document.getElementById("recommendation-grid");

    fetch("/api/recommendations")
        .then(response => response.json())
        .then(activities => {
            recommendationGrid.innerHTML = ""; // Clear loading text

            if (activities.message) {
                recommendationGrid.innerHTML = `<p>${activities.message}</p>`;
                return;
            }

            activities.forEach(activity => {
                const activityCard = document.createElement("div");
                activityCard.classList.add("activity-card");
                activityCard.dataset.id = activity.id;
                activityCard.innerHTML = `
                    <h2>${activity.name}</h2>
                    <p>${activity.description}</p>
                    <p>Price: $${activity.price}</p>
                    <p>Type: ${activity.type}</p>
                    <p>Location: ${activity.location}</p>
                    <button class="bookmark-btn" data-id="${activity.id}">Bookmark</button>
                `;
                recommendationGrid.appendChild(activityCard);
            });
        })
        .catch(error => {
            console.error("Error fetching recommendations:", error);
            recommendationGrid.innerHTML = "<p>Failed to load recommendations.</p>";
        });
});
