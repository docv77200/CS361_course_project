document.addEventListener('DOMContentLoaded', () => {
    const bookmarkButtons = document.querySelectorAll('.bookmark-btn');

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
                    // Toggle button text dynamically
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
});
