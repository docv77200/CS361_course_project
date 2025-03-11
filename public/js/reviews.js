document.addEventListener("DOMContentLoaded", () => {
    // Handle displaying average rating and total reviews when page loads
    document.querySelectorAll(".star-rating").forEach(starsContainer => {
        const activityId = starsContainer.dataset.id;
        const avgRatingElement = document.getElementById(`avg-rating-${activityId}`);

        // Fetch the average rating for the activity
        fetch(`/api/reviews/${activityId}`)
            .then(response => response.json())
            .then(data => {
                const { average_rating, total_reviews } = data;
                avgRatingElement.textContent = `Average Rating: ${average_rating} ★ (${total_reviews} reviews)`;
            })
            .catch(error => {
                console.error("Error fetching average rating:", error);
            });

        // Handle the rating system when stars are clicked
        starsContainer.addEventListener("click", async (event) => {
            const rating = parseInt(event.target.dataset.value);
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
                    // Update the average rating after submission
                    fetch(`/api/reviews/${activityId}`)
                        .then(response => response.json())
                        .then(data => {
                            const { average_rating, total_reviews } = data;
                            avgRatingElement.textContent = `Average Rating: ${average_rating} ★ (${total_reviews} reviews)`;
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

    // Toggle reviews visibility when "View Reviews" is clicked
    document.querySelectorAll(".view-reviews-btn").forEach(button => {
        button.addEventListener("click", async (event) => {
            const activityId = button.dataset.id;
            const reviewsContainer = document.getElementById(`reviews-${activityId}`);
            reviewsContainer.style.display = reviewsContainer.style.display === "none" ? "block" : "none";

            // Fetch reviews for the activity
            try {
                const response = await fetch(`/api/reviews/${activityId}`);
                const reviews = await response.json();
                const reviewsList = reviewsContainer.querySelector(".reviews-list");
                reviewsList.innerHTML = "";

                if (reviews.length > 0) {
                    reviews.forEach(review => {
                        const li = document.createElement("li");
                        li.innerHTML = `<strong>${review.username}</strong>: ${review.comment} (${review.rating} ★)`;
                        reviewsList.appendChild(li);
                    });
                } else {
                    reviewsList.innerHTML = "<p>No reviews yet.</p>";
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        });
    });
});
