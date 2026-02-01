export async function initPosts(){
    const posts = await fetchPosts();

    const container = document.getElementById("my-posts");
    if (!container) return;

    if (!posts || posts.length === 0) {
        container.innerHTML = `<p>No posts yet</p>`;
        return;
    }

    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const recentPosts = posts.slice(0,3);

    renderPosts(recentPosts);
}

async function fetchPosts(){
    const res = await fetch("http://localhost:8000/post");

    if(!res.ok){
        console.log("Could not fetch the posts");
        return;
    }

    const posts = await res.json();

    return posts;
}

function renderPosts(posts){
    const container = document.getElementById("my-posts");

    if(!container) return;

    container.innerHTML = "";

    posts.forEach(p => {
        const card = document.createElement("div");
        
        const date = new Date(p.created_at);

        card.innerHTML = `
            <h3>${p.title}</h3>
            <p>${p.content}</p>
            <p>${date}</p>
        `
        
        container.appendChild(card);
    });
}
