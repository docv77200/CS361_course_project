document.addEventListener("DOMContentLoaded", function() {
    // 🎯 Open and Close the Filters Modal
    document.getElementById("open-filters-btn").addEventListener("click", function() {
        document.getElementById("filters-modal").style.display = "block";
    });

    document.querySelector(".close-btn").addEventListener("click", function() {
        document.getElementById("filters-modal").style.display = "none";
    });

    // 🛠 Apply Filters (Redirect to /explore with filters)
    document.getElementById("apply-filters-btn").addEventListener("click", function() {
        const location = document.getElementById("location").value;
        const activityType = document.getElementById("activity-type").value;
        const budget = document.getElementById("budget").value;

        window.location.href = `/explore?location=${location}&activity_type=${activityType}&budget=${budget}`;
    });

    // 🔄 Reset Filters (Reload /explore without filters)
    document.getElementById("reset-filters-btn").addEventListener("click", function() {
        window.location.href = `/explore`;
    });
});
