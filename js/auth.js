// =========================
// REGISTER
// =========================

function getRegisteredUsers() {

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const legacyUser = JSON.parse(localStorage.getItem("user"));

    if (legacyUser && !users.some(function(user) {
        return String(user.email || "").trim().toLowerCase()
            === String(legacyUser.email || "").trim().toLowerCase();
    })) {
        legacyUser.isLegacyUser = true;
        users.push(legacyUser);
    }

    return users;

}


function migrateLegacyUserData(user) {

    if (!user.isLegacyUser) {
        return;
    }

    const prefix = "userData:" + encodeURIComponent(user.email.trim().toLowerCase()) + ":";

    ["accounts", "categories", "expenses", "transactions"].forEach(function(key) {

        const scopedKey = prefix + key;

        if (localStorage.getItem(scopedKey) === null) {
            const legacyValue = localStorage.getItem(key);

            if (legacyValue !== null) {
                localStorage.setItem(scopedKey, legacyValue);
            }
        }

    });

}


const registerForm = document.querySelector("#registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {

        event.preventDefault();

        let name = document.getElementById("name").value.trim();
        let email = document.getElementById("email").value.trim();
        let password = document.getElementById("password").value;
        let confirmPassword = document.getElementById("confirm-password").value;

        // Check password
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const users = getRegisteredUsers();

        if (users.some(function(user) {
            return String(user.email || "").trim().toLowerCase()
                === email.toLowerCase();
        })) {
            alert("An account with this email already exists. Please log in.");
            return;
        }

        // Create user with its own independent dashboard data.
        let user = {
            name: name,
            email: email,
            password: password
        };

        users.push(user);
        localStorage.setItem("users", JSON.stringify(users));

        // Go to login page
        window.location.href = "login.html";
    });
}


// =========================
// LOGIN
// =========================

const loginForm = document.querySelector("#loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        let email = document.getElementById("email").value.trim().toLowerCase();
        let password = document.getElementById("password").value;

        const users = getRegisteredUsers();

        if (users.length === 0) {
            alert("User not registered. Please register first.");
            return;
        }

        const user = users.find(function(registeredUser) {
            return String(registeredUser.email || "").trim().toLowerCase()
                === email
                && registeredUser.password === password;
        });

        if (user) {

            migrateLegacyUserData(user);
            sessionStorage.setItem("activeUserEmail", user.email.trim().toLowerCase());

            // Store login status
            sessionStorage.setItem("isLoggedIn", "true");

            // Go directly to the dashboard after a successful login
            window.location.href = "dashboard.html";

        } else {
            alert("Invalid name or password!");
        }
    });
}