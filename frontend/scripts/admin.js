import Chart from "https://cdn.jsdelivr.net/npm/chart.js/auto/+esm";
import { getWeekKey } from "./helper-functions.js";
import { groupContactsByWeek } from "./helper-functions.js";
import { groupContactsByDayOfWeek } from "./helper-functions.js";

let cachedContacts = [];
let contacts = [];
let StatusTimeout;
const token = localStorage.getItem("token");

function normalize(value){
    return value === "null" ? null : value;
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadContacts();

    const urlParams = new URLSearchParams(window.location.search);

    const filters = {
        status: normalize(urlParams.get("status")),
        dateFrom: normalize(urlParams.get("dateFrom")),
        dateTo: normalize(urlParams.get("dateTo")),
        order: normalize(urlParams.get("order")),
        alphabetical: normalize(urlParams.get("alphabetical"))
    };

    const filteredContacts = filter(filters); 
    renderContacts(filteredContacts);

    renderWeeklyChart();
    buildReadUnreadChart();
    buildMessagesPerDay();

    const filterBtn = document.getElementById("filter");
    if (!filterBtn) return;

    filterBtn.addEventListener("click", () => {
        window.location.href = "../pages/filters.html";
    });
});


async function loadContacts(){
    if(!token){
        window.location.href = "../pages/admin-login.html";
        return;
    } else {
        try {
            const res = await fetch('http://localhost:8000/contact', {
                headers: { "Authorization": `Bearer ${token}` }
            })

            if(!res.ok){
                localStorage.removeItem("token");
                window.location.href = "../pages/admin-login.html";
                return;
            } 

            cachedContacts = await res.json();

        } catch(err) {
            window.location.href = "../pages/admin-login.html";
        }
    }
}

function renderContacts(cachedContacts) {
    const container = document.getElementById("contacts");
    container.innerHTML = "";

    if (cachedContacts.length == 0){
        container.innerHTML = `
        <p>No contacts yet.</p>
        `
        return;
    }
    cachedContacts.forEach(c => {
        const card = document.createElement("div");
        if(c.is_read == 0) card.className ="contact-card not-read";
        else card.className = "contact-card read";

        card.innerHTML = `
        <h3>${c.name}</h3>
        <p>${c.email}</p>
        <p>${c.message}</p>
        `
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-btn");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteContact(c.id);
        });

        if(c.is_read == 0){
            const markReadButton = document.createElement("button");
            markReadButton.classList.add("mark-read-btn");
            markReadButton.type = "button";
            markReadButton.textContent = "Mark as read"

            markReadButton.addEventListener("click", () => {
                markAsRead(c.id);
            })

            card.appendChild(markReadButton);
        }

        const responseButton = document.createElement("button");
        responseButton.classList.add("response-btn");
        responseButton.type = "button";
        responseButton.textContent = "Respond to message";

        responseButton.addEventListener("click", () => {
            window.location.href = `../pages/reply.html?contact_id=${c.id}`;
        });

        card.appendChild(responseButton);

        card.appendChild(deleteButton);
        card.appendChild(document.createElement("hr"));
        container.appendChild(card);            
    });
}

async function deleteContact(id){
    const ok = confirm("Are you sure you want to delete this contact?")
    if(!ok) return 

    try{
        const res = await fetch(`http://localhost:8000/contact/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if(!res.ok){
            throw new Error("Failed to delete contact");
        }

        showStatus("Contact deleted!", "success");
        loadContacts(); //refresh the UI
    } catch(err){
        showStatus(err.message, "error")
        console.log(err);
    }
}

async function markAsRead(id){
    try {
        const res = await fetch(`http://localhost:8000/contact/${id}`, {
            method: "PATCH", //modifying some fields
            headers:  {
                "Content-Type": "application/json" ,
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ is_read: true })
        });
        
        if(!res.ok){
            throw new Error("Failed to mark as read")
        } 

        await loadContacts();
        renderContacts(cachedContacts)
    } catch(err){
        console.log(err);
    }
}

function showStatus(message, type = "success"){
    const status = document.getElementById("status");
    status.textContent = message;
    status.className = `status ${type}`; // chenge class for different css styles

    clearTimeout(StatusTimeout);

    StatusTimeout = setTimeout(() => {
        status.className = "status hidden"
    }, 3000);
}

export function filter(filterObject){
    let sorted = [...cachedContacts];

    switch (filterObject.status){
        case "read":
            sorted = sorted.filter((elem) => !elem.is_read);
            break;
        case "unread":
            sorted = sorted.filter((elem) => elem.is_read);
            break;
        default:
            break;
    }

    switch (filterObject.order){
        case "recent-oldest":
            sorted.sort((a, b) => b.id - a.id);
            break;
        case "oldest-recent":
            sorted.sort((a, b) => a.id - b.id);
            break;
        default:
            break;
    }

    if(filterObject.dateFrom != null && filterObject.dateTo != null){
        const from = new Date(filterObject.dateFrom);
        const to = new Date(filterObject.dateTo);

        sorted = sorted.filter(contact => {
            const ts = new Date(contact.timestamp);
            return ts >= from && ts <= to;
        });
    }

    switch(filterObject.alphabetical){
        case "a-z":
            sorted.sort((a,b) => a.name.localeCompare(b.name));
            break;
        case "z-a":
            sorted.sort((a,b) => b.name.localeCompare(a.name));
            break;
        default:
            break;
    }

    return sorted;
}

document.getElementById("search").addEventListener("input", (e) => {
    contacts = [];
    const value = e.target.value.toLowerCase();
    console.log(value);


    cachedContacts.forEach(contact => {
        const isVisible = contact.name.toLowerCase().includes(value) || contact.email.toLowerCase().includes(value);
        if (isVisible) contacts.push(contact);
    })
    renderContacts(contacts);
});


function renderWeeklyChart() {
    const grouped = groupContactsByWeek(cachedContacts);

    const allWeeks = Object.keys(grouped).sort();

    const lastWeeks = allWeeks.slice(-7);

    const data = lastWeeks.map(week => grouped[week]);

    

    new Chart(document.getElementById("messages-week"), {
        type: "line",
        data: {
            labels: lastWeeks,
            datasets: [{
                label: "Contacts per week",
                data: data,
                borderColor: "rgb(22, 23, 105)",
                backgroundColor: "rgba(37, 65, 206, 0.2)",
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


function buildReadUnreadChart(){
    const read_unread = document.getElementById("read-unread");

    let read = 0;
    let unread = 0;

    cachedContacts.forEach(c => {
        if(c.is_read == 0) unread++;
        else read++;
    })


    const data2 = {
        labels: ["Read", "Unread"],
        datasets: [{
            data: [read, unread],
            backgroundColor: [
                "rgb(237, 113, 24)",
                "rgb(22, 23, 105)",
            ]
        }]
    };

    new Chart(read_unread, {
        type: "pie",
        data: data2,
    });
}

function buildMessagesPerDay(){
    const mess_day = document.getElementById("messages-day");

    const grouped = groupContactsByDayOfWeek(cachedContacts);

    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const dataValues = labels.map(day => grouped[day] || 0);

    const data3 = {
    labels: labels,
    datasets: [{
        label: 'Messages per Day of Week',
        data: dataValues,
        fill: false,
        borderColor:'rgb(4, 5, 63)',
        backgroundColor:'rgb(22, 23, 105)',
    }]
    };

    new Chart(mess_day, {
        type: "bar",
        data: data3,
    });
}

