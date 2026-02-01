import { showToast } from "./helper-functions.js";

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("post_id");

    if(!id){
        console.log("Invalid post id");
        window.location.href = "../pages/admin.html";
        return;
    }

    EditPost(id);
});

async function EditPost(id){
    const res = await fetch(`http://localhost:8000/post/${id}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });

    if(!res.ok){
        throw new Error("Failed to fetch post");
    }

    const post = await res.json();

    const container = document.getElementById("atual-post");

    container.innerHTML = "";

    const card = document.createElement("div");


    card.innerHTML = `
        <h3><strong>Title:</strong>${post.title}</h3>
        <p><strong>Content:</strong>${post.content}</p>
    `

    container.appendChild(card);

    document.getElementById("title").value = post.title;
    document.getElementById("content").value = post.content;
    document.getElementById("published").checked = post.published;

    document.getElementById("edit-post").addEventListener("submit", async (e) => {
        e.preventDefault();

        const ok = confirm("Are you sure you want to keep this changes?")
        if(!ok) return 

        const data = {
            title: document.getElementById("title").value,
            content: document.getElementById("content").value,
            published: document.getElementById("published").checked,
        };

        const res = await fetch(`http://localhost:8000/post/${id}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });


        if(res.status === 404){
            const error = await res.json();
            showToast(error.detail, "error");
            return;
        }

        window.location.href = "../pages/admin.html";
    });
}