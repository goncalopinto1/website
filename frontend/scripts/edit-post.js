export async function EditPost(id){
    const res = await fetch(`http://localhost:8000/post/${id}`, {
        method: "GET",
        header: { "Authorization": `Bearer ${token}` }
    });

    if(!res.ok){
        throw new Error("Failed to delte post");
    }

    const post = res.json();

    const container = document.getElementById("atual-post");

    container.innerHTML = "";

    const card = document.createElement("div");


    card.innerHTML = `
        <h3><strong>Title:</strong>${post.title}</h3>
        <p><strong>Content:</strong>${post.content}</p>
        <p><strong>Published:</strong>${post.published}</p>
    `

    container.appendChild(card);

    document.getElementById("edit-post").addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            title: document.getElementById("title").value,
            content: document.getElementById("content").value,
            published: document.getElementById("message").value,
        };
    })
}