document.addEventListener('DOMContentLoaded', () => {
    const viewBookmarksBtn = document.getElementById('view-bookmarks-btn');
    const bookmarkModal = document.getElementById('bookmark-modal');
    const bookmarkedList = document.getElementById('bookmarked-list');
    const closeModalBtn = document.querySelector('.close-btn');

    // Fetch and display bookmarked activities when the button is clicked
    viewBookmarksBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/get-bookmarks', { method: 'GET' });

            // Ensure response is OK and is JSON
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();

            // Clear previous list
            bookmarkedList.innerHTML = '';

            if (result.success && result.bookmarkedActivities.length > 0) {
                result.bookmarkedActivities.forEach(activity => {
                    const li = document.createElement('li');
                    li.textContent = `${activity.name} - ${activity.type}`;
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
    closeModalBtn.addEventListener('click', () => {
        bookmarkModal.style.display = 'none';
    });
});
