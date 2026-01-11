let cachedContacts = [];

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

async function renderContacts(cachedContacts) {
    const container = document.getElementById("contacts");
    container.innerHTML = "";

    cachedContacts.forEach(c => {
        const card = document.createElement("div");
        card.classList.add("contact-card");

        card.innerHTML = `
        <h3>${c.name}</h3>
        <p>${c.email}</p>
        <p>${c.message}</p>
        `
        const button = document.createElement("button");
        button.id = "delete"
        button.type = "button";
        button.textContent = "Delete";

        button.addEventListener("click", () => {
            deleteContact(c.id);
        })

        card.appendChild(button);
        container.appendChild(document.createElement("hr"));
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

        loadContacts(); //refresh the UI
    } catch(err){
        console.log(err);
    }
}

document.getElementById("filter").addEventListener("change", (e) => {
    let sorted = [...cachedContacts] //makes a copy of the array the = would make them look to the same object

    if(e.target.value == "Newest"){
        sorted.sort((a, b) => b.id - a.id); // if > 0 then b comes before a
    }
    else if(e.target.value == "Oldest"){
        sorted.sort((a, b) => a.id - b.id);
    }
    else if(e.target.value == "Alphabetic"){
        sorted.sort((a, b) => a.name.localeCompare(b.name)); // A-Z
    }

    return renderContacts(sorted);
});

document.addEventListener("DOMContentLoaded", () => {
    loadContacts();
});
