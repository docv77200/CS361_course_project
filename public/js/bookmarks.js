document.addEventListener('DOMContentLoaded', () => {
    const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
    const viewBookmarksBtn = document.getElementById('view-bookmarks-btn');
    const bookmarkModal = document.getElementById('bookmark-modal');
    const bookmarkedList = document.getElementById('bookmarked-list');
    const closeModalBtn = document.querySelector('.close-btn');

    // Ensure all bookmark buttons are functional
    if (bookmarkButtons.length === 0) {
        console.warn("No bookmark buttons found on the page.");
    }

    bookmarkButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const activityId = button.dataset.id?.trim();  // Ensure we get a valid ID

            if (!activityId) {
                console.error('Error: Missing activity ID in button', button);
                alert('Error: Unable to bookmark this activity.');
                return;
            }

            const action = button.textContent.includes('Remove') ? 'remove' : 'add';

            try {
                const response = await fetch('/api/bookmark', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ activityId, action })
                });

                const result = await response.json();

                if (result.success) {
                    button.textContent = action === 'add' ? 'Remove Bookmark' : 'Bookmark';
                } else {
                    alert(`Failed to update bookmarks: ${result.error}`);
                }
            } catch (error) {
                alert('Error: Could not update bookmarks.');
                console.error('Bookmarking error:', error);
            }
        });
    });

    // Fetch and display bookmarked activities when "View Bookmarked Activities" is clicked
    viewBookmarksBtn?.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/get-bookmarks', { method: 'GET' });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Fetched Bookmarked Activities:", result.bookmarkedActivities);

            // Clear previous list
            bookmarkedList.innerHTML = '';

            if (result.success && result.bookmarkedActivities.length > 0) {
                result.bookmarkedActivities.forEach(activity => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${activity.name}</strong> - ${activity.type}`;
                    bookmarkedList.appendChild(li);
                });
            } else {
                bookmarkedList.innerHTML = '<p>No bookmarked activities yet.</p>';
            }

            // Show modal
            bookmarkModal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
            alert('Failed to fetch bookmarked activities.');
        }
    });

    // Close modal when clicking the close button
    closeModalBtn?.addEventListener('click', () => {
        bookmarkModal.style.display = 'none';
    });
});
