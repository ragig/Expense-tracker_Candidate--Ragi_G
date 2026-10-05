
// ==========================================
// STORAGE.JS
// Expense Tracker
// Local Storage Management
// ==========================================


// ==========================================
// USER
// ==========================================

// Save user

function saveUser(user) {

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );

}


// Get user

function getUser() {

    const user =
        localStorage.getItem("user");

    if (!user) {
        return null;
    }

    return JSON.parse(user);

}


// Delete user

function deleteUser() {

    localStorage.removeItem("user");

}



// ==========================================
// CATEGORIES
// ==========================================

// Save categories

function saveCategories(categories) {

    setUserData("categories", JSON.stringify(categories));

}


// Get categories

function getCategories() {

    const categories =
        getUserData("categories");

    if (!categories) {
        return [];
    }

    return JSON.parse(categories);

}


// Delete all categories

function deleteCategories() {

    setUserData("categories", JSON.stringify([]));

}



// ==========================================
// ACCOUNTS
// ==========================================

// Save accounts

function saveAccounts(accounts) {

    setUserData("accounts", JSON.stringify(accounts));

}


// Get accounts

function getAccounts() {

    const accounts =
        getUserData("accounts");

    if (!accounts) {
        return [];
    }

    return JSON.parse(accounts);

}


// Delete all accounts

function deleteAccounts() {

    setUserData("accounts", JSON.stringify([]));

}



// ==========================================
// EXPENSES
// ==========================================

// Save expenses

function saveExpenses(expenses) {

    setUserData("expenses", JSON.stringify(expenses));

}


// Get expenses

function getExpenses() {

    const expenses =
        getUserData("expenses");

    if (!expenses) {
        return [];
    }

    return JSON.parse(expenses);

}


// Delete all expenses

function deleteExpenses() {

    setUserData("expenses", JSON.stringify([]));

}



// ==========================================
// LOGIN STATUS
// ==========================================

// Set login status

function setLoginStatus(status) {

    sessionStorage.setItem(
        "isLoggedIn",
        status
    );

}


// Get login status

function getLoginStatus() {

    return sessionStorage.getItem(
        "isLoggedIn"
    ) === "true";

}


// Logout

function logoutUser() {

    sessionStorage.removeItem(
        "isLoggedIn"
    );

}



// ==========================================
// CLEAR ALL DATA
// ==========================================

function clearAllData() {

    localStorage.clear();

}
