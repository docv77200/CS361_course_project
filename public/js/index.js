document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    if (!form) {
        console.warn("⚠️ No form found on this page, skipping form validation.");
        return; // Prevent error if form doesn't exist
    }

    form.addEventListener('submit', (event) => {
        const username = form.querySelector('input[name="username"]');
        const password = form.querySelector('input[name="password"]');
        const securityAnswer = form.querySelector('input[name="securityAnswer"]');

        // Check if the required fields exist before accessing their values
        if (!username || !password) {
            console.error("❌ Error: Form fields are missing.");
            return;
        }

        // Ensure required fields are filled out
        if (!username.value.trim() || !password.value.trim() || (securityAnswer && !securityAnswer.value.trim())) {
            event.preventDefault();
            alert('⚠️ Please fill in all required fields.');
        }
    });
});
