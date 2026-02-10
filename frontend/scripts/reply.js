import { showToast } from "./helper-functions.js";

let StatusTimeout;

document.addEventListener("DOMContentLoaded", async () => {
    const url_parameters = new URLSearchParams(window.location.search);
    const contact_id = url_parameters.get("contact_id");

    const token = localStorage.getItem("token");

    
    if(!token){
        console.log("❌ invalid token");
        window.location.href = "../pages/admin-login.html";
        return;
    }

    if(!contact_id){
        console.log("❌ null contact_id");
        window.location.href = "../pages/admin.html";
        return;
    }

    try{
        const res = await fetch(`/contact/${contact_id}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if(!res.ok){
            window.location.href = "../pages/admin-login.html";
            return;
        }

        const contact = await res.json();

        if(!contact){
            showToast("Contact not found ❌", "error");
            window.location.href = "../pages/admin.html";
            return;
        }

        document.getElementById("from").innerHTML =`<p class="admin text"><strong>From: </strong>${contact.name} (${contact.email})</p>`;
        document.getElementById("message").innerHTML = `<p class="admin text"><strong>Message: </strong>${contact.message}</p>`;

    } catch (error){
        console.log("❌ Error:", error);
        showToast("Error loading content ❌", "error");
    }
});

document.getElementById("reply-form").addEventListener("submit", async (e) => {
    e.preventDefault()

    const url_parameters = new URLSearchParams(window.location.search);
    const contact_id = url_parameters.get("contact_id");

    const token = localStorage.getItem("token");

    if(!token){
        console.log("❌ invalid token");
        window.location.href = "../pages/admin.html";
        return;
    }

    if(!contact_id){
        console.log("❌ null contact_id");
        window.location.href = "../pages/admin.html";
        return;
    }

    const response = {
        message: document.getElementById("reply-message").value.trim()
    }

    try {
        const res = await fetch(`/contact/${contact_id}/reply`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(response)
        });

        if(!res.ok){
            console.log("❌ Fetch error");
            showToast("Error sending reply ❌", "error");
            return;
        }

        const status = document.getElementById("status");
        status.innerText = "Reply sent!";
        status.className = "status success";

        const r = await fetch(`/contact/${contact_id}`, {
            method: "PATCH", //modifying some fields
            headers:  {
                "Content-Type": "application/json" ,
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ is_read: true })
        });
        
        if(!r.ok){
            throw new Error("Failed to mark as read")
        } 

        window.location.href = "../pages/admin.html";

    } catch(error){
        console.log("Error:", error);
        return;
    }
});