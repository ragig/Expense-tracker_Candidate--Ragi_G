function showFormMessage(form, message, isError) {

    const messageElement =
        form.querySelector(".form-message");

    if (!messageElement) {
        throw new Error("Form feedback element is missing.");
    }

    messageElement.textContent = message;
    messageElement.classList.toggle("is-error", isError);
    messageElement.classList.toggle("is-success", !isError);
    messageElement.setAttribute("role", isError ? "alert" : "status");
    messageElement.setAttribute(
        "aria-live",
        isError ? "assertive" : "polite"
    );

}

function clearFormMessage(form) {

    const messageElement =
        form.querySelector(".form-message");

    if (!messageElement) {
        throw new Error("Form feedback element is missing.");
    }

    messageElement.textContent = "";
    messageElement.classList.remove("is-error", "is-success");
    messageElement.setAttribute("role", "status");
    messageElement.setAttribute("aria-live", "polite");

}
