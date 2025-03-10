document.addEventListener('DOMContentLoaded', () => {
    const filterForm = document.getElementById('filter-form');
    const resetButton = document.getElementById('reset-filters'); // Reset button
    const activityGrid = document.getElementById('activity-grid');

    // Apply Filters
    filterForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const location = document.getElementById('location').value.trim();
        const activityType = document.getElementById('activity-type').value;
        const budget = document.getElementById('budget').value;

        console.log("📩 Sending filter request:", { location, activityType, budget });

        try {
            const response = await fetch('/api/filter-activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location, activityType, budget })
            });

            const result = await response.json();
            console.log("✅ Filtered Activities:", result.activities);

            // Clear previous activities
            activityGrid.innerHTML = '';

            if (result.success && result.activities.length > 0) {
                result.activities.forEach(activity => {
                    const activityCard = document.createElement('div');
                    activityCard.classList.add('activity-card');
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
                activityGrid.innerHTML = '<p>No activities match your criteria.</p>';
            }
        } catch (error) {
            console.error("❌ Error filtering activities:", error);
            alert('Failed to apply filters.');
        }
    });

    // Reset Filters Button
    resetButton.addEventListener('click', async () => {
        document.getElementById('location').value = '';
        document.getElementById('activity-type').value = 'outdoor';
        document.getElementById('budget').value = '$0';

        console.log("🔄 Reset filters and reloading all activities...");

        try {
            const response = await fetch('/explore', { method: 'GET' });
            const text = await response.text();

            // Extract activities from response HTML and update the page
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const newActivityGrid = doc.getElementById('activity-grid').innerHTML;
            activityGrid.innerHTML = newActivityGrid;

            console.log("✅ Activities reset to default.");
        } catch (error) {
            console.error("❌ Error resetting filters:", error);
            alert('Failed to reset filters.');
        }
    });
});
