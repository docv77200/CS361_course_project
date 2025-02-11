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
