// ======================================
// ACCOUNT MANAGEMENT
// ======================================
// Get account form

const accountForm =
    document.getElementById("accountForm");


// Get account list

const accountList =
    document.getElementById("accountList");


// Get existing accounts from localStorage

let accounts =
    JSON.parse(getUserData("accounts")) || [];


// ======================================
// DISPLAY ACCOUNTS
// ======================================

function displayAccounts() {
    accountList.replaceChildren();

    if (accounts.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 4;
        cell.className = "no-accounts";
        cell.textContent = "No accounts added yet.";
        row.appendChild(cell);
        accountList.appendChild(row);
        return;
    }

    accounts.forEach(function(account, index) {
        const row = document.createElement("tr");
        [account.name, account.type, "₹" + Number(account.balance).toFixed(2)]
            .forEach(function(value) {
                const cell = document.createElement("td");
                cell.textContent = value || "-";
                row.appendChild(cell);
            });
        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function() { deleteAccount(index); });
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        accountList.appendChild(row);
    });

}


// ======================================
// ADD ACCOUNT
// ======================================

accountForm.addEventListener(
    "submit",
    function(event) {

        clearFormMessage(accountForm);

        // Stop page refresh

        event.preventDefault();


        // Get form values

        const name =
            document.getElementById("accountName")
                .value
                .trim();

        const type =
            document.getElementById("accountType")
                .value;

        const balance =
            document.getElementById("balance")
                .value;

        const numericBalance = Number(balance);

        if (name === "") {

            showFormMessage(
                accountForm,
                "Please enter an account name.",
                true
            );

            return;

        }

        if (type === "") {

            showFormMessage(
                accountForm,
                "Please select an account type.",
                true
            );

            return;

        }

        if (
            balance === "" ||
            !Number.isFinite(numericBalance) ||
            numericBalance < 0
        ) {

            showFormMessage(
                accountForm,
                "Enter a valid balance of zero or more.",
                true
            );

            return;

        }

        const duplicate =
            accounts.some(function(existingAccount) {

                return String(existingAccount.name || "").toLowerCase()
                    === name.toLowerCase();

            });

        if (duplicate) {

            showFormMessage(
                accountForm,
                "This account already exists. Select it in Expenses instead of adding it again.",
                true
            );

            return;

        }


        // Create account object

        const account = {

            name: name,

            type: type,

            balance: numericBalance,

            initialBalance: numericBalance

        };


        // Add account to array

        accounts.push(account);


        // Save accounts

        setUserData("accounts", JSON.stringify(accounts));


        // Clear form

        accountForm.reset();


        // Refresh account list

        displayAccounts();

        showFormMessage(
            accountForm,
            "Account added successfully.",
            false
        );

    }
);


accountForm.addEventListener("input", function() {

    clearFormMessage(accountForm);

});

accountForm.addEventListener("change", function() {

    clearFormMessage(accountForm);

});


// ======================================
// DELETE ACCOUNT
// ======================================

function deleteAccount(index) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this account?"
        );


    if (!confirmDelete) {
        return;
    }


    // Remove account

    accounts.splice(index, 1);


    // Save updated accounts

    setUserData("accounts", JSON.stringify(accounts));


    // Display updated list

    displayAccounts();

}


// ======================================
// LOGOUT
// ======================================

function logout() {

    logoutCurrentUser();

}


// ======================================
// LOAD ACCOUNTS WHEN PAGE OPENS
// ======================================

displayAccounts();
