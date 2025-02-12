document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', (event) => {
        const username = form.querySelector('input[name="username"]').value;
        const password = form.querySelector('input[name="password"]').value;
        const securityAnswer = form.querySelector('input[name="securityAnswer"]').value;

        if (!username || !password || !securityAnswer) {
            event.preventDefault();
            alert('Please fill in all required fields.');
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    if (!form) {
        console.warn("Form not found, skipping event listener setup.");
        return; // Prevent error if form doesn't exist on the page
    }

    form.addEventListener('submit', (event) => {
        const username = form.querySelector('input[name="username"]').value;
        const password = form.querySelector('input[name="password"]').value;
        const securityAnswer = form.querySelector('input[name="securityAnswer"]');

        if (!username || !password || (securityAnswer && !securityAnswer.value)) {
            event.preventDefault();
            alert('Please fill in all required fields.');
        }
    });
});

