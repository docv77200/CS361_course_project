document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    if (!form) {
        console.warn("⚠️ No form found on this page, skipping validation.");
        return; // Stop execution if no form exists
    }

    form.addEventListener("submit", (event) => {
        const formType = form.getAttribute("action"); // Check which form is being submitted

        // Common Fields
        const username = form.querySelector('input[name="username"]');
        const password = form.querySelector('input[name="password"]');

        // Profile Setup Fields
        const city = form.querySelector('select[name="city"]');
        const securityQuestion = form.querySelector('select[name="securityQuestion"]');
        const securityAnswer = form.querySelector('input[name="securityAnswer"]');
        const interests = form.querySelectorAll('input[name="interests"]:checked');

        // Forgot Password Fields
        const forgotSecurityAnswer = form.querySelector('input[name="securityAnswer"]');

        // Reset Password Fields
        const newPassword = form.querySelector('input[name="newPassword"]');
        const confirmPassword = form.querySelector('input[name="confirmPassword"]');

        let errors = [];

        // Validate Sign-in Form
        if (formType === "/signin") {
            if (!username || !password || !username.value.trim() || !password.value.trim()) {
                errors.push("Username and Password are required.");
            }
        }

        // Validate Forgot Password Form
        else if (formType === "/forgot-password") {
            if (!username || !forgotSecurityAnswer || !username.value.trim() || !forgotSecurityAnswer.value.trim()) {
                errors.push("Username and Security Answer are required.");
            }
        }

        // Validate Reset Password Form
        else if (formType === "/reset-password") {
            if (!newPassword || !confirmPassword || !newPassword.value.trim() || !confirmPassword.value.trim()) {
                errors.push("New Password and Confirm Password are required.");
            } else if (newPassword.value !== confirmPassword.value) {
                errors.push("Passwords do not match.");
            }
        }

        // Validate Profile Setup Form
        else if (formType === "/profile") {
            if (!username || !password || !city || !securityQuestion || !securityAnswer) {
                errors.push("All fields are required.");
            } else if (!username.value.trim() || !password.value.trim() || !securityAnswer.value.trim()) {
                errors.push("Please fill in all required fields.");
            } else if (interests.length === 0) {
                errors.push("Please select at least one interest.");
            }
        }

        // If errors exist, prevent form submission and alert user
        if (errors.length > 0) {
            event.preventDefault();
            alert(errors.join("\n"));
        }
    });
});
