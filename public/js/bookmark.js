document.addEventListener('DOMContentLoaded', () => {
    const bookmarkButtons = document.querySelectorAll('.bookmark-btn');

    bookmarkButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const activityId = button.dataset.id;
            const action = button.textContent.includes('Remove') ? 'remove' : 'add';

            // Make an API request to update bookmarks
            const response = await fetch('/api/bookmark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'testuser',  // Replace with the logged-in user's username
                    activityId,
                    action
                })
            });

            if (response.ok) {
                const result = await response.json();

                // Update button text dynamically
                button.textContent = action === 'add' ? 'Remove Bookmark' : 'Bookmark';
            } else {
                alert('Failed to update bookmarks.');
            }
        });
    });
});
