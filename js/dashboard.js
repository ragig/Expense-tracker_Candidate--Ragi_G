
// ==========================================
// DASHBOARD.JS
// Expense Tracker Dashboard
// ==========================================


// ==========================================
// GET DATA FROM LOCAL STORAGE
// ==========================================

// Get categories
let categories =
    JSON.parse(getUserData("categories")) || [];


// Get accounts
let accounts =
    JSON.parse(getUserData("accounts")) || [];


// Get expenses
let expenses =
    JSON.parse(getUserData("expenses")) || [];


// If expenses are stored as transactions
// use transactions if expenses is empty

if (expenses.length === 0) {

    expenses =
        JSON.parse(getUserData("transactions")) || [];

}

// Records created before transaction types were introduced are expenses.
expenses = expenses.map(function(transaction) {

    return Object.assign({ type: "expense" }, transaction);

});

function isExpense(transaction) {

    return transaction.type !== "income";

}


// ==========================================
// TOTAL CATEGORIES
// ==========================================

const totalCategories =
    document.getElementById("totalCategories");

if (totalCategories) {

    totalCategories.textContent =
        categories.length;

}


// ==========================================
// TOTAL ACCOUNTS
// ==========================================

const totalAccounts =
    document.getElementById("totalAccounts");

const totalBalance =
    document.getElementById("totalBalance");

if (totalAccounts) {

    totalAccounts.textContent =
        accounts.length;

}


// ==========================================
// CALCULATE TOTAL EXPENSES
// ==========================================

let totalExpenseAmount = 0;


expenses.forEach(function(expense) {

    let amount = Number(expense.amount) || 0;

    if (isExpense(expense)) {

        totalExpenseAmount += amount;

    }

});


// Display total expenses

const totalExpenses =
    document.getElementById("totalExpenses");

if (totalExpenses) {

    totalExpenses.textContent =
        "₹" + totalExpenseAmount.toFixed(2);

}

// ==========================================
// DISPLAY RECENT EXPENSES
// ==========================================

const recentExpenses =
    document.getElementById("recentExpenses");


function renderRecentTransactions() {

    if (!recentExpenses) {

        return;

    }

    recentExpenses.replaceChildren();

    const recentExpenseTransactions = expenses.filter(isExpense);

    if (recentExpenseTransactions.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.className = "no-expenses";
        cell.textContent = "No transactions added yet.";
        row.appendChild(cell);
        recentExpenses.appendChild(row);
        return;

    }

    recentExpenseTransactions.slice(-5).reverse().forEach(function(transaction) {

        const row = document.createElement("tr");
        const description = transaction.description || transaction.title || transaction.name || "-";
        [
            transaction.date || "-",
            "Expense",
            transaction.category || "-",
            description,
            "₹" + (Number(transaction.amount) || 0).toFixed(2)
        ].forEach(function(value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        recentExpenses.appendChild(row);

    });

}

renderRecentTransactions();

// ==========================================
// LOGOUT
// ==========================================

function logout() {

    logoutCurrentUser();

}


// ==========================================
// REFRESH DASHBOARD DATA
// ==========================================

// This function can be called whenever
// you want to refresh the dashboard.

function loadDashboard() {

    // Get latest categories

    categories =
        JSON.parse(
            getUserData("categories")
        ) || [];


    // Get latest accounts

    accounts =
        JSON.parse(
            getUserData("accounts")
        ) || [];


    // Get latest expenses

    expenses =
        JSON.parse(
            getUserData("expenses")
        ) || [];


    // If no expenses, check transactions

    if (expenses.length === 0) {

        expenses =
            JSON.parse(
                getUserData("transactions")
            ) || [];

    }

    expenses = expenses.map(function(transaction) {

        return Object.assign({ type: "expense" }, transaction);

    });

    renderRecentTransactions();


    // Update category count

    if (totalCategories) {

        totalCategories.textContent =
            categories.length;

    }


    // Update account count

    if (totalAccounts) {

        totalAccounts.textContent =
            accounts.length;

    }

    // Calculate total balance across all accounts

    const balance = accounts.reduce(function(total, account) {

        return total + (Number(account.balance) || 0);

    }, 0);

    if (totalBalance) {

        totalBalance.textContent =
            "₹" + balance.toFixed(2);

    }


    // Calculate expense total

    let total = 0;


    expenses.forEach(function(expense) {

        if (isExpense(expense)) {

            total += Number(expense.amount) || 0;

        }

    });


    // Update expense total

    if (totalExpenses) {

        totalExpenses.textContent =
            "₹" + total.toFixed(2);

    }

    renderExpenseInsights();

}

function getExpenseDate(dateValue) {

    const isoDate =
        /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateValue || ""));

    if (isoDate) {

        const year = Number(isoDate[1]);
        const month = Number(isoDate[2]);
        const day = Number(isoDate[3]);
        const parsedDate = new Date(year, month - 1, day);

        return month >= 1 &&
            month <= 12 &&
            day >= 1 &&
            parsedDate.getMonth() === month - 1 &&
            parsedDate.getDate() === day
                ? parsedDate
                : null;

    }

    const parsedDate =
        new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return parsedDate;

}

function getExpenseMonth(dateValue) {

    const date = getExpenseDate(dateValue);

    return date
        ? new Date(date.getFullYear(), date.getMonth(), 1)
        : null;

}

function formatExpenseDate(date) {

    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");

}

function getWeekStart(weekValue) {

    const isoWeek =
        /^(\d{4})-W(\d{2})$/.exec(String(weekValue || ""));

    if (!isoWeek) {
        return null;
    }

    const year = Number(isoWeek[1]);
    const week = Number(isoWeek[2]);
    const januaryFourth = new Date(year, 0, 4);
    const mondayOffset =
        (januaryFourth.getDay() + 6) % 7;
    const start =
        new Date(year, 0, 4 - mondayOffset + (week - 1) * 7);

    return week >= 1 && week <= 53 && getISOWeekValue(start) === weekValue
        ? start
        : null;

}

function getISOWeekValue(date) {

    const mondayOffset =
        (date.getDay() + 6) % 7;

    const thursday =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + 3 - mondayOffset
        );

    const januaryFourth =
        new Date(thursday.getFullYear(), 0, 4);

    const firstWeekMonday =
        new Date(
            januaryFourth.getFullYear(),
            januaryFourth.getMonth(),
            januaryFourth.getDate() -
                (januaryFourth.getDay() + 6) % 7
        );

    const weekNumber =
        1 + Math.round(
            (Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate() - mondayOffset
            ) - Date.UTC(
                firstWeekMonday.getFullYear(),
                firstWeekMonday.getMonth(),
                firstWeekMonday.getDate()
            )) / 604800000
        );

    return thursday.getFullYear() +
        "-W" + String(weekNumber).padStart(2, "0");

}

function renderExpenseInsights() {

    const categoryChart =
        document.getElementById("categoryExpenseChart");

    const categoryExpenseMonthPicker =
        document.getElementById("categoryExpenseMonthPicker");

    const categoryExpenseFilter =
        document.getElementById("categoryExpenseFilter");

    const monthlyChart =
        document.getElementById("monthlyExpenseChart");

    const currentMonthLabel =
        document.getElementById("currentMonthLabel");

    const currentMonthExpenses =
        document.getElementById("currentMonthExpenses");

    const expenseMonthPicker =
        document.getElementById("expenseMonthPicker");

    const categoryTotals = new Map();
    const monthlyTotals = new Map();
    const dailyTotals = new Map();
    const expenseSummaryView =
        document.getElementById("expenseSummaryView");

    const expensePeriodLabel =
        document.getElementById("expensePeriodLabel");

    const expenseDayPicker =
        document.getElementById("expenseDayPicker");

    const expenseDayPickerControl =
        document.getElementById("expenseDayPickerControl");

    const expenseWeekPicker =
        document.getElementById("expenseWeekPicker");

    const expenseWeekPickerControl =
        document.getElementById("expenseWeekPickerControl");

    const now = new Date();
    const currentMonth =
        new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthKey =
        currentMonth.getFullYear() + "-" +
        String(currentMonth.getMonth() + 1).padStart(2, "0");

    if (expenseMonthPicker && !expenseMonthPicker.value) {

        expenseMonthPicker.value = currentMonthKey;

    }

    if (categoryExpenseMonthPicker && !categoryExpenseMonthPicker.value) {

        categoryExpenseMonthPicker.value = currentMonthKey;

    }

    const previousCategory =
        categoryExpenseFilter ? categoryExpenseFilter.value : "";

    if (categoryExpenseFilter) {

        const usedCategories =
            Array.from(new Set(expenses.filter(isExpense).map(function(expense) {

                return String(expense.category || "Uncategorized");

            }))).sort(function(first, second) {

                return first.localeCompare(second);

            });

        categoryExpenseFilter.replaceChildren();

        const allCategoriesOption =
            document.createElement("option");

        allCategoriesOption.value = "";
        allCategoriesOption.textContent = "All categories";
        categoryExpenseFilter.appendChild(allCategoriesOption);

        usedCategories.forEach(function(category) {

            const option =
                document.createElement("option");

            option.value = category;
            option.textContent = category;
            categoryExpenseFilter.appendChild(option);

        });

        categoryExpenseFilter.value =
            usedCategories.includes(previousCategory)
                ? previousCategory
                : "";

    }

    expenses.forEach(function(expense) {

        if (!isExpense(expense)) {

            return;

        }

        const amount = Number(expense.amount);

        if (!Number.isFinite(amount)) {
            return;
        }

        const category =
            String(expense.category || "Uncategorized");

        const month =
            getExpenseMonth(expense.date);
        const expenseDate =
            getExpenseDate(expense.date);

        if (month && expenseDate) {

            const key =
                month.getFullYear() + "-" +
                String(month.getMonth() + 1).padStart(2, "0");
            const dayKey =
                key + "-" +
                String(expenseDate.getDate()).padStart(2, "0");

            monthlyTotals.set(
                key,
                (monthlyTotals.get(key) || 0) + amount
            );

            dailyTotals.set(
                dayKey,
                (dailyTotals.get(dayKey) || 0) + amount
            );

            if (
                !categoryExpenseMonthPicker ||
                key === categoryExpenseMonthPicker.value
            ) {

                if (
                    !categoryExpenseFilter ||
                    !categoryExpenseFilter.value ||
                    categoryExpenseFilter.value === category
                ) {

                    categoryTotals.set(
                        category,
                        (categoryTotals.get(category) || 0) + amount
                    );

                }

            }
        }

    });

    if (categoryChart) {

        categoryChart.replaceChildren();

        const sortedCategories =
            Array.from(categoryTotals.entries())
                .sort(function(first, second) {

                    return second[1] - first[1];

                });

        if (sortedCategories.length === 0) {

            const emptyMessage =
                document.createElement("p");

            emptyMessage.className = "chart-empty";
            emptyMessage.textContent = "No expense data to display yet.";
            categoryChart.appendChild(emptyMessage);

        } else {

            const maximum =
                Math.max(...sortedCategories.map(function(item) {

                    return item[1];

                }));

            sortedCategories.forEach(function(item) {

                const row =
                    document.createElement("div");

                row.className = "category-chart-item";

                const heading =
                    document.createElement("div");

                heading.className = "chart-item-heading";

                const name =
                    document.createElement("span");

                name.textContent = item[0];

                const total =
                    document.createElement("strong");

                total.textContent = "₹" + item[1].toFixed(2);
                heading.append(name, total);

                const track =
                    document.createElement("div");

                track.className = "chart-track";

                const bar =
                    document.createElement("div");

                bar.className = "chart-bar";
                const barHeight =
                    maximum > 0
                        ? item[1] / maximum * 100
                        : 0;

                bar.style.height =
                    item[1] > 0
                        ? Math.max(10, barHeight) + "%"
                        : "0%";
                bar.title =
                    item[0] + ": ₹" + item[1].toFixed(2);

                track.appendChild(bar);
                row.append(heading, track);
                categoryChart.appendChild(row);

            });

        }

    }

    if (expenseDayPicker && !expenseDayPicker.value) {

        expenseDayPicker.value = formatExpenseDate(now);

    }

    if (expenseWeekPicker && !expenseWeekPicker.value) {

        expenseWeekPicker.value = getISOWeekValue(now);

    }

    const selectedDay =
        expenseDayPicker && expenseDayPicker.value
            ? getExpenseDate(expenseDayPicker.value)
            : null;

    const selectedWeekStart =
        expenseWeekPicker
            ? getWeekStart(expenseWeekPicker.value)
            : null;

    const selectedMonth =
        /^(\d{4})-(\d{2})$/.exec(
            expenseMonthPicker ? expenseMonthPicker.value : ""
        );

    const selectedMonthKey =
        expenseMonthPicker && expenseMonthPicker.value
            ? expenseMonthPicker.value
            : currentMonthKey;

    const summaryView =
        expenseSummaryView ? expenseSummaryView.value : "monthly";

    if (expenseDayPickerControl) {

        expenseDayPickerControl.hidden = summaryView !== "daily";

    }

    if (expenseWeekPickerControl) {

        expenseWeekPickerControl.hidden = summaryView !== "weekly";

    }

    if (expenseMonthPicker) {

        expenseMonthPicker.closest("label").hidden = summaryView !== "monthly";

    }

    if (expensePeriodLabel) {

        expensePeriodLabel.textContent =
            summaryView === "daily"
                ? "Choose a date"
                : summaryView === "weekly"
                    ? "Choose a week"
                    : "Choose a month";

    }

    if (currentMonthLabel) {

        currentMonthLabel.textContent =
            summaryView === "daily"
                ? selectedDay
                    ? selectedDay
                    .toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    })
                    : "Choose a date"
                : summaryView === "monthly"
                    ? selectedMonth
                        ? new Date(
                            Number(selectedMonth[1]),
                            Number(selectedMonth[2]) - 1,
                            1
                        ).toLocaleDateString("en-IN", {
                            month: "long",
                            year: "numeric"
                        })
                        : "Choose a month"
                    : selectedWeekStart
                        ? "Week of " + selectedWeekStart.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        })
                        : "Choose a week";

    }

    if (currentMonthExpenses) {

        const summaryTotal =
            summaryView === "daily"
                ? dailyTotals.get(expenseDayPicker.value) || 0
                : summaryView === "weekly" && selectedWeekStart
                    ? Array.from({ length: 7 }).reduce(function(total, _, index) {

                        const date =
                            new Date(
                                selectedWeekStart.getFullYear(),
                                selectedWeekStart.getMonth(),
                                selectedWeekStart.getDate() + index
                            );

                        return total +
                            (dailyTotals.get(formatExpenseDate(date)) || 0);

                    }, 0)
                    : monthlyTotals.get(selectedMonthKey) || 0;

        currentMonthExpenses.textContent =
            "₹" + summaryTotal.toFixed(2);

    }

    if (monthlyChart) {

        monthlyChart.replaceChildren();

        monthlyChart.classList.toggle(
            "is-detailed",
            summaryView !== "monthly"
        );

        const chartItems = [];

        if (summaryView === "daily" && selectedDay) {

            chartItems.push({
                label: selectedDay.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short"
                }),
                total: dailyTotals.get(expenseDayPicker.value) || 0
            });

        } else if (summaryView === "weekly" && selectedWeekStart) {

            for (let day = 0; day < 7; day += 1) {

                const date =
                    new Date(
                        selectedWeekStart.getFullYear(),
                        selectedWeekStart.getMonth(),
                        selectedWeekStart.getDate() + day
                    );

                chartItems.push({
                    label: date.toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric"
                    }),
                    total: dailyTotals.get(formatExpenseDate(date)) || 0
                });

            }

        } else if (summaryView === "monthly" && selectedMonth) {

            const monthDate =
                new Date(
                    Number(selectedMonth[1]),
                    Number(selectedMonth[2]) - 1,
                    1
                );

            chartItems.push({
                label: monthDate.toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric"
                }),
                total: monthlyTotals.get(selectedMonthKey) || 0
            });

        }

        if (chartItems.length > 0) {

            const maximum =
                Math.max(...chartItems.map(function(item) {

                    return item.total;

                }));

            chartItems.forEach(function(item) {

                const row =
                    document.createElement("div");

                row.className = "monthly-chart-item";

                const heading =
                    document.createElement("div");

                heading.className = "chart-item-heading";

                const label =
                    document.createElement("span");

                label.textContent = item.label;

                const total =
                    document.createElement("strong");

                total.textContent = "₹" + item.total.toFixed(2);
                heading.append(label, total);

                const track =
                    document.createElement("div");

                track.className = "chart-track";

                const bar =
                    document.createElement("div");

                bar.className = "chart-bar";
                const barHeight =
                    maximum > 0
                        ? item.total / maximum * 100
                        : 0;

                bar.style.height =
                    item.total > 0
                        ? Math.max(10, barHeight) + "%"
                        : "0%";
                bar.title =
                    item.label + ": ₹" + item.total.toFixed(2);

                track.appendChild(bar);
                row.append(heading, track);
                monthlyChart.appendChild(row);

            });

        } else {

            const row =
                document.createElement("p");

            row.className = "chart-empty";
            row.textContent = "Choose a valid period to display expenses.";
            monthlyChart.appendChild(row);

        }

    }

}

// ==========================================
// OPEN MANAGEMENT PAGES IN DASHBOARD
// ==========================================

const dashboardPagePanel =
    document.getElementById("dashboardPagePanel");

const dashboardPageFrame =
    document.getElementById("dashboardPageFrame");

const dashboardPageButtons =
    document.querySelectorAll("[data-dashboard-page]");

function showDashboardPage(page) {

    const pageTitle = {
        "categories.html": "Manage Categories",
        "account.html": "Manage Accounts",
        "expense.html": "Manage Expenses"
    }[page];

    if (!pageTitle || !dashboardPagePanel || !dashboardPageFrame) {
        return;
    }

    dashboardPagePanel.hidden = false;
    document.body.classList.add("showing-dashboard-page");
    document.documentElement.classList.add("dashboard-page-locked");

    dashboardPageButtons.forEach(function(button) {

        button.setAttribute(
            "aria-expanded",
            String(button.dataset.dashboardPage === page)
        );

    });

    if (dashboardPageFrame.getAttribute("src") !== page) {
        dashboardPageFrame.setAttribute("src", page);
    }

}

dashboardPageButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const page = button.dataset.dashboardPage;

        if (
            !dashboardPagePanel.hidden &&
            dashboardPageFrame &&
            dashboardPageFrame.getAttribute("src") === page
        ) {
            dashboardPagePanel.hidden = true;
            document.body.classList.remove("showing-dashboard-page");
            document.documentElement.classList.remove("dashboard-page-locked");

            dashboardPageButtons.forEach(function(pageButton) {

                pageButton.setAttribute("aria-expanded", "false");

            });

            return;
        }

        showDashboardPage(page);

        dashboardPagePanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});

if (dashboardPageFrame) {

    dashboardPageFrame.addEventListener("load", function() {

        const frameDocument =
            dashboardPageFrame.contentDocument;

        if (!frameDocument) {
            return;
        }

        frameDocument.querySelectorAll(
            'a[href="categories.html"], a[href="account.html"], a[href="expense.html"], a[href="dashboard.html"]'
        ).forEach(function(link) {

            link.addEventListener("click", function(event) {

                event.preventDefault();
                const page = link.getAttribute("href");

                if (page === "dashboard.html") {

                    dashboardPagePanel.hidden = true;
                    document.body.classList.remove("showing-dashboard-page");
                    document.documentElement.classList.remove("dashboard-page-locked");
                    loadDashboard();

                    dashboardPageButtons.forEach(function(button) {

                        button.setAttribute("aria-expanded", "false");

                    });

                    return;
                }

                showDashboardPage(page);

            });

        });

    });

}

const expenseMonthPicker =
    document.getElementById("expenseMonthPicker");

if (expenseMonthPicker) {

    expenseMonthPicker.addEventListener("change", renderExpenseInsights);

}

const expenseDayPicker =
    document.getElementById("expenseDayPicker");

if (expenseDayPicker) {

    expenseDayPicker.addEventListener("change", renderExpenseInsights);

}

const expenseWeekPicker =
    document.getElementById("expenseWeekPicker");

if (expenseWeekPicker) {

    expenseWeekPicker.addEventListener("change", renderExpenseInsights);

}

const expenseSummaryView =
    document.getElementById("expenseSummaryView");

if (expenseSummaryView) {

    expenseSummaryView.addEventListener("change", renderExpenseInsights);

}

const categoryExpenseMonthPicker =
    document.getElementById("categoryExpenseMonthPicker");

if (categoryExpenseMonthPicker) {

    categoryExpenseMonthPicker.addEventListener("change", renderExpenseInsights);

}

const categoryExpenseFilter =
    document.getElementById("categoryExpenseFilter");

if (categoryExpenseFilter) {

    categoryExpenseFilter.addEventListener("change", renderExpenseInsights);

}

window.addEventListener("storage", function(event) {

    const currentUserPrefix = getCurrentUserDataPrefix();
    const changedUserDataKey = event.key && event.key.startsWith(currentUserPrefix)
        ? event.key.slice(currentUserPrefix.length)
        : "";

    if (userDataKeys.includes(changedUserDataKey)) {
        loadDashboard();
    }

});


// ==========================================
// LOAD DASHBOARD
// ==========================================

loadDashboard();
