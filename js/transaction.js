// Transaction management. Existing untyped records remain expenses.
const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");
const submitButton = expenseForm.querySelector('button[type="submit"]');
const formHeading = document.getElementById("expenseFormHeading");
const cancelEditButton = document.getElementById("cancelEdit");
const categoryFilter = document.getElementById("categoryFilter");
let editingExpenseIndex = null;

let categories = JSON.parse(getUserData("categories")) || [];
let accounts = JSON.parse(getUserData("accounts")) || [];
let expenses = (JSON.parse(getUserData("expenses")) || []).map(function(transaction) {
    return Object.assign({ type: "expense" }, transaction);
});

function formatCurrency(value) { return "₹" + Number(value).toFixed(2); }

function loadCategories() {
    const categorySelect = document.getElementById("category");
    const selectedCategory = categorySelect.value;
    categorySelect.replaceChildren(new Option("Select Category", ""));
    categories.forEach(function(category) { categorySelect.add(new Option(category.icon + " " + category.name, category.name)); });
    categorySelect.value = selectedCategory;
    const selectedFilter = categoryFilter.value;
    const availableCategoryNames = Array.from(new Set(
        categories.map(function(category) { return category.name; }).concat(
            expenses.map(function(transaction) { return transaction.category; })
        ).filter(Boolean)
    )).sort();
    categoryFilter.replaceChildren(new Option("All categories", ""));
    availableCategoryNames.forEach(function(categoryName) { categoryFilter.add(new Option(categoryName, categoryName)); });
    categoryFilter.value = selectedFilter;
}

function loadAccounts() {
    const accountSelect = document.getElementById("account");
    const selectedAccount = accountSelect.value;
    accountSelect.replaceChildren(new Option("Select Account", ""));
    accounts.forEach(function(account) { accountSelect.add(new Option(account.name, account.name)); });
    accountSelect.value = selectedAccount;
}

function getFilteredTransactions() {
    return expenses.map(function(transaction, index) { return { transaction: transaction, index: index }; }).filter(function(item) {
        return item.transaction.type !== "income"
            && (!categoryFilter.value || item.transaction.category === categoryFilter.value);
    });
}

function displayExpenses() {
    expenseList.replaceChildren();
    const visibleTransactions = getFilteredTransactions();
    if (visibleTransactions.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 7;
        cell.className = "no-expenses";
        cell.textContent = expenses.some(function(transaction) {
            return transaction.type !== "income";
        }) ? "No transactions match these filters." : "No expenses added yet.";
        row.appendChild(cell); expenseList.appendChild(row); return;
    }
    visibleTransactions.forEach(function(item) {
        const transaction = item.transaction;
        const row = document.createElement("tr");
        [transaction.date, "Expense", transaction.category, transaction.account, transaction.description].forEach(function(value) {
            const cell = document.createElement("td"); cell.textContent = value || "-"; row.appendChild(cell);
        });
        const amount = document.createElement("td"); amount.className = "amount"; amount.textContent = formatCurrency(transaction.amount); row.appendChild(amount);
        const actions = document.createElement("td");
        const editButton = document.createElement("button"); editButton.className = "edit-btn"; editButton.textContent = "Edit"; editButton.addEventListener("click", function() { editExpense(item.index); });
        const deleteButton = document.createElement("button"); deleteButton.className = "delete-btn"; deleteButton.textContent = "Delete"; deleteButton.addEventListener("click", function() { deleteExpense(item.index); });
        actions.append(editButton, deleteButton); row.appendChild(actions); expenseList.appendChild(row);
    });
}

function recalculateAccountBalances() {
    const storedAccounts = JSON.parse(getUserData("accounts")) || [];
    storedAccounts.forEach(function(account) {
        if (!Number.isFinite(Number(account.initialBalance))) account.initialBalance = Number(account.balance) || 0;
        const transactionTotal = expenses.reduce(function(total, transaction) {
            if (transaction.account !== account.name) return total;
            const amount = Number(transaction.amount);
            return total + (Number.isFinite(amount) ? (transaction.type === "income" ? amount : -amount) : 0);
        }, 0);
        account.balance = Math.round((Number(account.initialBalance) + transactionTotal) * 100) / 100;
    });
    accounts = storedAccounts;
    setUserData("accounts", JSON.stringify(storedAccounts));
}

function getAvailableAccountBalance(accountName, excludedIndex) {
    const account = accounts.find(function(item) { return item.name === accountName; });
    if (!account) return null;
    const startingBalance = Number.isFinite(Number(account.initialBalance)) ? Number(account.initialBalance) : Number(account.balance) || 0;
    return startingBalance + expenses.reduce(function(total, transaction, index) {
        if (index === excludedIndex || transaction.account !== accountName) return total;
        const amount = Number(transaction.amount);
        return total + (Number.isFinite(amount) ? (transaction.type === "income" ? amount : -amount) : 0);
    }, 0);
}

function resetExpenseForm() { editingExpenseIndex = null; formHeading.textContent = "Add Transaction"; submitButton.textContent = "Add Transaction"; cancelEditButton.hidden = true; }

expenseForm.addEventListener("submit", function(event) {
    event.preventDefault(); clearFormMessage(expenseForm);
    const amount = Number(document.getElementById("amount").value);
    const date = document.getElementById("expenseDate").value;
    const category = document.getElementById("category").value;
    const account = document.getElementById("account").value;
    const description = document.getElementById("description").value.trim();
    if (!Number.isFinite(amount) || amount <= 0) return showFormMessage(expenseForm, "Please enter an amount greater than zero.", true);
    if (!date) return showFormMessage(expenseForm, "Please select a date.", true);
    if (!category) return showFormMessage(expenseForm, "Please select a category.", true);
    if (!account) return showFormMessage(expenseForm, "Please select an account.", true);
    if (!description) return showFormMessage(expenseForm, "Please enter a description.", true);
    const availableBalance = getAvailableAccountBalance(account, editingExpenseIndex);
    if (availableBalance === null) return showFormMessage(expenseForm, "The selected account is no longer available. Please choose an account.", true);
    if (amount > availableBalance) return showFormMessage(expenseForm, "Balance low. Available in this account: " + formatCurrency(Math.max(0, availableBalance)) + ".", true);
    const transaction = { amount: amount, date: date, type: "expense", category: category, account: account, description: description };
    const wasEditing = editingExpenseIndex !== null;
    if (wasEditing) expenses[editingExpenseIndex] = transaction; else expenses.push(transaction);
    setUserData("expenses", JSON.stringify(expenses)); recalculateAccountBalances(); expenseForm.reset(); resetExpenseForm(); displayExpenses();
    showFormMessage(expenseForm, wasEditing ? "Transaction updated successfully." : "Transaction added successfully.", false);
});

function editExpense(index) {
    const transaction = expenses[index]; if (!transaction) return;
    editingExpenseIndex = index;
    document.getElementById("amount").value = transaction.amount; document.getElementById("expenseDate").value = transaction.date;
    document.getElementById("category").value = transaction.category;
    document.getElementById("account").value = transaction.account; document.getElementById("description").value = transaction.description;
    formHeading.textContent = "Edit Transaction"; submitButton.textContent = "Update Transaction"; cancelEditButton.hidden = false;
    expenseForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteExpense(index) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    expenses.splice(index, 1); setUserData("expenses", JSON.stringify(expenses)); recalculateAccountBalances();
    if (editingExpenseIndex === index) { expenseForm.reset(); resetExpenseForm(); }
    displayExpenses();
}

cancelEditButton.addEventListener("click", function() { expenseForm.reset(); resetExpenseForm(); clearFormMessage(expenseForm); });
expenseForm.addEventListener("input", function() { clearFormMessage(expenseForm); });
categoryFilter.addEventListener("change", displayExpenses);
function logout() { logoutCurrentUser(); }
loadCategories(); loadAccounts(); resetExpenseForm(); displayExpenses();
