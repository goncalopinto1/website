export async function loadProject() {
    console.log("yeyyy");
    try {
        const container = document.getElementById("my-projects"); 
        if (!container) return;

        const res = await fetch("http://localhost:8000/projects");
        const projects = await res.json();

        container.innerHTML = ""; // limpa antes

        projects.forEach(p => {
            const card = document.createElement("div");

            card.innerHTML = `
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <p><strong>Linguagem:</strong> ${p.language ?? "N/A"}</p>
                <a href="${p.url}" target="_blank">See on GitHub</a>
                <hr>
            `;

            container.appendChild(card);
        });
    } catch (err) {
        console.error("Erro ao carregar projetos:", err);
    };
}
