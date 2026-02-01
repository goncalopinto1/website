import { showToast } from "./helper-functions.js";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    CreatePost();
});

async function CreatePost(){
    const form = document.getElementById("add-post");

    if(!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const ok = confirm("Are you sure you want to send this Post?")
        if(!ok) return;

        const data = {
            title:  document.getElementById("title").value,
            content: document.getElementById("content").value,
            published: document.getElementById("published").checked
        };

        const res = await fetch("http://localhost:8000/post", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        });

        if(!res.ok){
            showToast("Error creating post ❌", "error");
            return;
        }

        const status = document.getElementById("status");
        status.className = "status success";
        status.innerText = "Post created";

        form.reset();
    });

    document.getElementById("home").addEventListener("click", () => {
        window.location.href = "../pages/admin.html";
    })
}