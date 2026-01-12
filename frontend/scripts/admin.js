let cachedContacts = [];
let StatusTimeout;

async function loadContacts(){
    try {
        const res = await fetch("http://localhost:8000/contact", {
            method: "GET"
        });
        cachedContacts = await res.json();
        renderContacts(cachedContacts);
    } catch(err) {
        console.error("Error in loading contacts:", err);
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
        card.classList.add("contact-card");

        card.innerHTML = `
        <h3>${c.name}</h3>
        <p>${c.email}</p>
        <p>${c.message}</p>
        `
        const button = document.createElement("button");
        button.classList.add("delete-btn");
        button.type = "button";
        button.textContent = "Delete";

        button.addEventListener("click", () => {
            deleteContact(c.id);
        })

        card.appendChild(button);
        card.appendChild(document.createElement("hr"));
        container.appendChild(card);            
    });
}

async function deleteContact(id){
    const ok = confirm("Are you sure you want to delete this contact?")
    if(!ok) return 

    try{
        const res = await fetch(`http://localhost:8000/contact/${id}`, {
            method: "DELETE"
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

function showStatus(message, type = "success"){
    const status = document.getElementById("status");
    status.textContent = message;
    status.className = `status ${type}`; // chenge class for different css styles

    clearTimeout(StatusTimeout);

    StatusTimeout = setTimeout(() => {
        status.className = "status hidden"
    }, 3000);
}

document.getElementById("filter").addEventListener("change", (e) => {
    let sorted = [...cachedContacts] //makes a copy of the array the = would make them look to the same object

    if(e.target.value == "newest"){
        sorted.sort((a, b) => b.id - a.id); // if > 0 then b comes before a
    }
    else if(e.target.value == "oldest"){
        sorted.sort((a, b) => a.id - b.id);
    }
    else if(e.target.value == "alphabetic"){
        sorted.sort((a, b) => a.name.localeCompare(b.name)); // A-Z
    }

    return renderContacts(sorted);
});

document.addEventListener("DOMContentLoaded", () => {
    loadContacts();
});
