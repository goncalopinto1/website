import { showToast } from "./helper-functions.js";

const filters = {
    status: null,
    order: null,
    dateFrom: null,
    dateTo: null,
    alphabetical: null
}

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async () => {
    if(!token){
        window.location.href = "../pages/admin-login.html";
        return;
    }

    try{
        const res = await fetch(`/contact`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if(!res.ok){
            window.location.href = "../pages/admin-login.html";
            return;
        }
    } catch(error){
        window.location.href = "../pages/admin-login.html";
    }
})

document.getElementById("apply-filters").addEventListener("click", () => {
    const selectedStatus = document.querySelector("input[name='status']:checked");

    filters.status = selectedStatus ? selectedStatus.value : null;

    const selectedOrder = document.querySelector("input[name='order']:checked");

    filters.order = selectedOrder ? selectedOrder.value : null;

    const dateFrom = document.getElementById("date-from").value || null;
    const dateTo = document.getElementById("date-to").value || null;

    filters.dateFrom = dateFrom;
    filters.dateTo = dateTo;

    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
        showToast("Invalid date interval", "error");
        return;
    }

    const selectedAlphabetic = document.querySelector("input[name='alphabetic']:checked");

    filters.alphabetical = selectedAlphabetic ? selectedAlphabetic.value : null;

    const query = new URLSearchParams(filters).toString();
    window.location.href = `../pages/admin.html?${query}`;
});

document.getElementById("clear-filters").addEventListener("click", () => {
    document.querySelectorAll("input[type='radio']").forEach(input => input.checked = false);

    document.querySelectorAll("input[type='date']").forEach(input => input.value = "");
});