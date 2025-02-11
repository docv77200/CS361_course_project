document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-account-form');

    form.addEventListener('submit', (event) => {
        const username = form.querySelector('input[name="username"]').value;
        const password = form.querySelector('input[name="password"]').value;
        const securityAnswers = form.querySelector('input[name="securityAnswers"]').value;

        // Simple client-side validation
        if (!username || !password || !securityAnswers) {
            event.preventDefault();  // Stop form submission
            alert('Please fill in all fields.');
        } else if (securityAnswers.split(',').length < 3) {
            event.preventDefault();
            alert('Please provide answers for all three security questions.');
        }
    });
});
