
// ==========================================
// CATEGORY MANAGEMENT
// Expense Tracker
// ==========================================


// ==========================================
// GET FORM AND LIST
// ==========================================

const categoryForm =
    document.getElementById("categoryForm");


const categoryList =
    document.getElementById("categoryList");

const categorySubmitButton =
    categoryForm.querySelector('button[type="submit"]');

const categoryFormHeading =
    document.getElementById("categoryFormHeading");

const cancelCategoryEditButton =
    document.getElementById("cancelCategoryEdit");

let editingCategoryIndex = null;



// ==========================================
// GET CATEGORIES FROM LOCAL STORAGE
// ==========================================

let categories =
    JSON.parse(getUserData("categories")) || [];



// ==========================================
// DISPLAY CATEGORIES
// ==========================================

function displayCategories() {
    categoryList.replaceChildren();

    if (categories.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 3;
        cell.className = "no-categories";
        cell.textContent = "No categories added yet.";
        row.appendChild(cell);
        categoryList.appendChild(row);
        return;
    }

    categories.forEach(function(category, index) {
        const row = document.createElement("tr");
        const iconCell = document.createElement("td");
        iconCell.className = "category-icon";
        iconCell.textContent = category.icon || "-";
        const nameCell = document.createElement("td");
        nameCell.textContent = category.name || "-";
        const actionCell = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function() { editCategory(index); });
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function() { deleteCategory(index); });
        actionCell.append(editButton, deleteButton);
        row.append(iconCell, nameCell, actionCell);
        categoryList.appendChild(row);
    });

}



// ==========================================
// ADD CATEGORY
// ==========================================

categoryForm.addEventListener(
    "submit",
    function(event) {

        clearFormMessage(categoryForm);

        // Prevent page refresh

        event.preventDefault();



        // Get category name

        const name =
            document
                .getElementById("categoryName")
                .value
                .trim();



        // Get icon

        const icon =
            document
                .getElementById("categoryIcon")
                .value;



        // Check category name

        if (name === "") {

            showFormMessage(
                categoryForm,
                "Please enter a category name.",
                true
            );

            return;
        }



        // Check icon

        if (icon === "") {

            showFormMessage(
                categoryForm,
                "Please select a category icon.",
                true
            );

            return;
        }



        // Check duplicate category, excluding the one being edited

        const duplicate =
            categories.some(function(category, index) {

                return index !== editingCategoryIndex
                    && category.name.toLowerCase() === name.toLowerCase();

            });



        if (duplicate) {

            showFormMessage(
                categoryForm,
                "This category already exists.",
                true
            );

            return;
        }



        // Create category object

        const category = {

            name: name,

            icon: icon

        };



        // Add or update category

        const wasEditing = editingCategoryIndex !== null;

        if (wasEditing) {
            const previousName = categories[editingCategoryIndex].name;
            categories[editingCategoryIndex] = category;

            if (previousName !== name) {
                const expenses =
                    JSON.parse(getUserData("expenses")) || [];

                expenses.forEach(function(expense) {
                    if (expense.category === previousName) {
                        expense.category = name;
                    }
                });

                setUserData("expenses", JSON.stringify(expenses));
            }
        } else {
            categories.push(category);
        }



        // Save categories

        setUserData("categories", JSON.stringify(categories));



        // Clear form

        categoryForm.reset();
        resetCategoryForm();



        // Refresh category list

        displayCategories();

        showFormMessage(
            categoryForm,
            wasEditing
                ? "Category updated successfully."
                : "Category added successfully.",
            false
        );

    }
);


categoryForm.addEventListener("input", function() {

    clearFormMessage(categoryForm);

});

categoryForm.addEventListener("change", function() {

    clearFormMessage(categoryForm);

});


function editCategory(index) {

    const category = categories[index];

    if (!category) {
        return;
    }

    editingCategoryIndex = index;
    document.getElementById("categoryName").value = category.name;
    document.getElementById("categoryIcon").value = category.icon;
    categoryFormHeading.textContent = "Edit Category";
    categorySubmitButton.textContent = "Update Category";
    cancelCategoryEditButton.hidden = false;
    clearFormMessage(categoryForm);
    categoryForm.scrollIntoView({ behavior: "instant", block: "start" });

}


function resetCategoryForm() {

    editingCategoryIndex = null;
    categoryFormHeading.textContent = "Add Category";
    categorySubmitButton.textContent = "Add Category";
    cancelCategoryEditButton.hidden = true;

}


cancelCategoryEditButton.addEventListener("click", function() {

    categoryForm.reset();
    resetCategoryForm();
    clearFormMessage(categoryForm);

});


// ==========================================
// DELETE CATEGORY
// ==========================================

function deleteCategory(index) {


    // Ask for confirmation

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this category?"
        );



    if (!confirmDelete) {

        return;
    }



    // Remove category

    categories.splice(index, 1);

    if (editingCategoryIndex === index) {
        categoryForm.reset();
        resetCategoryForm();
        clearFormMessage(categoryForm);
    } else if (editingCategoryIndex !== null && editingCategoryIndex > index) {
        editingCategoryIndex -= 1;
    }



    // Save updated categories

    setUserData("categories", JSON.stringify(categories));



    // Refresh list

    displayCategories();

}



// ==========================================
// LOGOUT
// ==========================================

function logout() {

    logoutCurrentUser();

}



// ==========================================
// LOAD CATEGORIES
// ==========================================

displayCategories();
