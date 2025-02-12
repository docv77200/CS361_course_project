document.addEventListener('DOMContentLoaded', () => {
    const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
    const viewBookmarksBtn = document.getElementById('view-bookmarks-btn');
    const bookmarkModal = document.getElementById('bookmark-modal');
    const bookmarkedList = document.getElementById('bookmarked-list');
    const closeModalBtn = document.querySelector('.close-btn');

    bookmarkButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const activityId = button.dataset.id;
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

    viewBookmarksBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/get-bookmarks');
            const result = await response.json();

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

            bookmarkModal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        }
    });

    closeModalBtn.addEventListener('click', () => {
        bookmarkModal.style.display = 'none';
    });
});
