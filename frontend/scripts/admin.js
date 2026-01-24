let cachedContacts = [];
let StatusTimeout;
const token = localStorage.getItem("token");

async function loadContacts(){
    if(!token){
        window.location.href = "../pages/adminLogin.html";
    } else {
        try {
            const res = await fetch('http://localhost:8000/contact', {
                headers: { "Authorization": `Bearer ${token}` }
            })

            if(!res.ok){
                localStorage.removeItem("token");
                window.location.href = "../pages/adminLogin.html";
            } else {
                const contacts = await res.json()
                cachedContacts = contacts;
                renderContacts(cachedContacts)
            }
        } catch(err) {
            window.location.href = "../pages/adminLogin.html";
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
        })

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

        loadContacts();
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
    else if(e.target.value == "not-read"){
        sorted = sorted.filter((elem) => !elem.is_read);
    }

    return renderContacts(sorted);
});

document.addEventListener("DOMContentLoaded", () => {
    loadContacts();
});
