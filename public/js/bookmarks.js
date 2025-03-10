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

    const updateModal = async () => {
        try {
            const response = await fetch('/api/get-bookmarks', { method: 'GET' });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const result = await response.json();
            console.log("📜 Updated Bookmarked Activities:", result.bookmarkedActivities);
    
            // Clear previous list
            bookmarkedList.innerHTML = '';
    
            if (result.success && result.bookmarkedActivities.length > 0) {
                result.bookmarkedActivities.forEach(activity => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${activity.name}</strong> - ${activity.description} 
                        <button class="remove-bookmark" data-id="${activity.id}">Remove</button>`;
                    bookmarkedList.appendChild(li);
                });
    
                // Add event listeners to remove buttons
                document.querySelectorAll('.remove-bookmark').forEach(button => {
                    button.addEventListener('click', () => removeBookmark(button.dataset.id));
                });
            } else {
                bookmarkedList.innerHTML = '<p>No bookmarked activities yet.</p>';
            }
        } catch (error) {
            console.error('❌ Error updating bookmarks modal:', error);
            alert('Failed to update bookmarked activities.');
        }
    };
    
    const removeBookmark = async (activityId) => {
        try {
            const response = await fetch('/api/bookmark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activityId, action: 'remove' })
            });

            const result = await response.json();

            if (result.success) {
                alert(`"${result.message}"`); // Show user notification
                updateModal(); // Update modal dynamically
                document.querySelector(`.bookmark-btn[data-id="${activityId}"]`).textContent = "Bookmark";
            }
        } catch (error) {
            console.error("Error removing bookmark:", error);
        }
    };

    bookmarkButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const activityId = button.dataset.id?.trim();
    
            if (!activityId) {
                console.error('Error: Missing activity ID in button', button);
                alert('Error: Unable to bookmark this activity.');
                return;
            }
    
            let action = button.textContent.trim().includes('Remove') ? 'remove' : 'add';
    
            console.log("🔄 Sending Bookmark Request:", { activityId, action }); // Debugging
    
            try {
                const response = await fetch('/api/bookmark', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ activityId, action })
                });
    
                const result = await response.json();
                console.log("✅ Server Response:", result); // Debugging
    
                if (result.success) {
                    button.textContent = action === 'add' ? 'Remove Bookmark' : 'Bookmark';
    
                    // 🟢 Notify the user via the notification microservice
                    await fetch('/api/notify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: result.message })
                    });
    
                    // 🔄 Update modal dynamically after bookmarking
                    updateModal();
                } else {
                    alert(`❌ Failed to update bookmarks: ${result.error}`);
                }
            } catch (error) {
                alert(' Error: Could not update bookmarks.');
                console.error(' Bookmarking error:', error);
            }
        });
    });
    

    // Fetch and display bookmarked activities when "View Bookmarked Activities" is clicked
    viewBookmarksBtn?.addEventListener('click', async () => {
        await updateModal();
        bookmarkModal.style.display = 'block';
    });

    // Close modal when clicking the close button
    closeModalBtn?.addEventListener('click', () => {
        bookmarkModal.style.display = 'none';
    });
});
