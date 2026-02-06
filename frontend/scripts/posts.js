export async function initPosts(){
    const allPosts = await fetchPosts();
    
    const posts = allPosts.filter(p => p.published);
    
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
    const res = await fetch("/post");

    if(!res.ok){
        console.log("Could not fetch the posts");
        return;
    }

    const posts = await res.json();

    return posts;
}

function renderPosts(posts) {
    const container = document.getElementById("my-posts");
    if(!container) return;
    
    container.innerHTML = "";
    
    posts.forEach((p) => {
        const postItem = document.createElement("div");
        postItem.className = "post-item";
        
        const title = document.createElement("h2");
        title.className = "post title";
        title.textContent = p.title;
        
        const content = document.createElement("div");
        content.className = "post content";
        const rawContent = p.content;
        const safeHTML = DOMPurify.sanitize(marked.parse(rawContent));
        content.innerHTML = safeHTML;
        
        postItem.appendChild(title);
        postItem.appendChild(content);
        
        container.appendChild(postItem);
    });
}
