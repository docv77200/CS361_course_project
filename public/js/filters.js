document.addEventListener("DOMContentLoaded", () => {
    const filterForm = document.getElementById("filter-form");
    const resetButton = document.getElementById("reset-filters");
    const activityGrid = document.getElementById("activity-grid");

    if (!filterForm || !resetButton || !activityGrid) {
        console.error(" Error: One or more required elements are missing from the DOM.");
        return; // Prevent script from running further if elements are missing
    }

    // Apply Filters
    filterForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const locationInput = document.getElementById("location");
        const activityTypeInput = document.getElementById("activity-type");
        const budgetInput = document.getElementById("budget");

        if (!locationInput || !activityTypeInput || !budgetInput) {
            console.error(" Error: One or more filter inputs are missing.");
            return;
        }

        const location = locationInput.value.trim();
        const activityType = activityTypeInput.value;
        const budget = budgetInput.value;

        console.log("📩 Sending filter request:", { location, activityType, budget });

        try {
            const response = await fetch("/api/filter-activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ location, activityType, budget })
            });

            const result = await response.json();
            console.log(" Filtered Activities:", result.activities);

            // Clear previous activities
            activityGrid.innerHTML = "";

            if (result.success && result.activities.length > 0) {
                result.activities.forEach(activity => {
                    const activityCard = document.createElement("div");
                    activityCard.classList.add("activity-card");
                    activityCard.dataset.id = activity.id;
                    activityCard.innerHTML = `
                        <h2>${activity.name}</h2>
                        <p>${activity.description}</p>
                        <p>Price: $${activity.price}</p>
                        <p>Distance: ${activity.distance} miles</p>
                        <p>Type: ${activity.type}</p>
                        <p>Time: ${activity.time}</p>
                        <p>Date: ${activity.date}</p>
                        <p>Location: ${activity.location}</p>
                        <button class="bookmark-btn" data-id="${activity.id}">Bookmark</button>
                    `;
                    activityGrid.appendChild(activityCard);
                });
            } else {
                activityGrid.innerHTML = "<p>No activities match your criteria.</p>";
            }
        } catch (error) {
            console.error(" Error filtering activities:", error);
            alert("Failed to apply filters.");
        }
    });

    // Reset Filters Button
    resetButton.addEventListener("click", async () => {
        const locationInput = document.getElementById("location");
        const activityTypeInput = document.getElementById("activity-type");
        const budgetInput = document.getElementById("budget");

        if (!locationInput || !activityTypeInput || !budgetInput) {
            console.error(" Error: One or more filter inputs are missing.");
            return;
        }

        locationInput.value = "";
        activityTypeInput.value = "None";
        budgetInput.value = "None";

        console.log("🔄 Reset filters and reloading all activities...");

        try {
            const response = await fetch("/explore", { method: "GET" });
            const text = await response.text();

            // Extract activities from response HTML and update the page
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/html");
            const newActivityGrid = doc.getElementById("activity-grid").innerHTML;
            activityGrid.innerHTML = newActivityGrid;

            console.log(" Activities reset to default.");
        } catch (error) {
            console.error(" Error resetting filters:", error);
            alert("Failed to reset filters.");
        }
    });
});
