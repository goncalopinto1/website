export async function CreatePost(id){
    const res = await fetch(`http://localhost:8000/post/${id}`, {
        method: "GET",
        header: { "Authorization": `Bearer ${token}` }
    });

    if(!res.ok){
        throw new Error("Failed to delte post");
    }

    
}