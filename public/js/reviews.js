document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".view-reviews-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const activityId = button.dataset.id;
            const reviewsContainer = document.getElementById(`reviews-${activityId}`);
            
            // Toggle visibility
            reviewsContainer.style.display = reviewsContainer.style.display === "none" ? "block" : "none";

            try {
                const response = await fetch(`/api/reviews/${activityId}`);
                const reviews = await response.json();
                
                const reviewsList = reviewsContainer.querySelector(".reviews-list");
                reviewsList.innerHTML = ""; // Clear previous reviews

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

    // Handle review submission
    document.querySelectorAll(".review-form").forEach(form => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch("/api/reviews", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                if (result.success) {
                    alert("Review submitted!");
                    form.reset();
                } else {
                    alert("Failed to submit review.");
                }
            } catch (error) {
                console.error("Error submitting review:", error);
            }
        });
    });
});
