document.addEventListener("DOMContentLoaded", () => {
    // Handle displaying average rating when the page loads
    document.querySelectorAll(".star-rating").forEach(starsContainer => {
        const activityId = starsContainer.dataset.id;
        const avgRatingElement = document.getElementById(`avg-rating-${activityId}`);

        // Fetch the average rating for each activity
        fetch(`/api/reviews/${activityId}`)
            .then(response => response.json())
            .then(data => {
                avgRatingElement.textContent = `Rating: ${data.average_rating} ★ (${data.total_reviews} reviews)`;
            })
            .catch(error => {
                console.error("Error fetching average rating:", error);
                avgRatingElement.textContent = "No ratings yet.";
            });

        // Handle star rating clicks
        starsContainer.querySelectorAll(".star").forEach(star => {
            star.addEventListener("click", async () => {
                const rating = parseInt(star.dataset.value);
                if (rating < 1 || rating > 5) return;

                // Submit the rating to the backend
                try {
                    const response = await fetch("/api/reviews", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            activity_id: activityId,
                            rating: rating
                        })
                    });

                    const result = await response.json();
                    if (result.success) {
                        alert(`You rated this activity ${rating} stars!`);

                        // Refresh the average rating after submission
                        fetch(`/api/reviews/${activityId}`)
                            .then(response => response.json())
                            .then(data => {
                                avgRatingElement.textContent = `Rating: ${data.average_rating} ★ (${data.total_reviews} reviews)`;
                            });
                    } else {
                        alert("Error submitting rating.");
                    }
                } catch (error) {
                    console.error("Error submitting rating:", error);
                    alert("Error submitting rating.");
                }
            });
        });
    });
});
