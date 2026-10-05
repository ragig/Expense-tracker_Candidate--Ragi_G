const userDataKeys = ["accounts", "categories", "expenses", "transactions"];

function getActiveUserEmail() {

    const email = sessionStorage.getItem("activeUserEmail");

    return email ? email.trim().toLowerCase() : "";

}


function isAuthenticated() {

    return sessionStorage.getItem("isLoggedIn") === "true" &&
        getActiveUserEmail() !== "";

}


function requireAuthenticatedUser() {

    if (isAuthenticated()) {
        return true;
    }

    // Pages can be opened inside the dashboard's same-origin iframe. Redirect
    // the whole app so an unsigned-in user never continues as the "guest".
    if (window.top !== window) {
        window.top.location.href = "login.html";
    } else {
        window.location.href = "login.html";
    }

    return false;

}


function logoutCurrentUser() {

    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("activeUserEmail");

    // A logout clicked in Categories, Accounts, or Expenses must leave the
    // complete dashboard, not just the embedded page.
    if (window.top !== window) {
        window.top.location.href = "login.html";
    }

}


function getCurrentUserDataPrefix() {

    const userId = getActiveUserEmail() || "guest";

    return "userData:" + encodeURIComponent(userId) + ":";

}


requireAuthenticatedUser();


function getUserData(key) {

    if (!userDataKeys.includes(key)) {
        throw new Error("Unsupported user data key: " + key);
    }

    return localStorage.getItem(getCurrentUserDataPrefix() + key);

}


function setUserData(key, value) {

    if (!userDataKeys.includes(key)) {
        throw new Error("Unsupported user data key: " + key);
    }

    localStorage.setItem(getCurrentUserDataPrefix() + key, value);

}
