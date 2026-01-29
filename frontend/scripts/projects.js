let languages = [];
let cachedProjects = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadProject();

    render_projects(cachedProjects);
});

export async function loadProject() {
    try {
        const res = await fetch("../data/projects.json");
        cachedProjects = await res.json();

        languages = [];
        cachedProjects.forEach(p => {
            if (p.languages) {
                p.languages.forEach(lang => {
                    if (!languages.includes(lang)) {
                        languages.push(lang);
                    }
                });
            }
        });

    } catch (err) {
        console.error("Erro ao carregar projetos:", err);
    };
}

function render_projects(projects) {
    const container = document.getElementById("my-projects"); 
    if (!container) return;

    container.innerHTML = ""; // limpa antes

        projects.forEach(p => {
            const card = document.createElement("div");
            const languagesHTML = p.languages 
            ? p.languages.map(lang => `<span class="tag">${lang}</span>`).join(", ") 
            : `<span class="tag">N/A</span>`;

            card.innerHTML = `
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <p><strong>Linguagem:</strong></p>
                <div class="tags">
                    ${languagesHTML}
                </div>
                <a href="${p.url}" target="_blank">See on GitHub</a>
                <hr>
            `;

            container.appendChild(card);
        });
}

document.getElementById("search").addEventListener("input", (e) => {
    let projects = [];
    const value = e.target.value.toLowerCase();

    cachedProjects.forEach(project => {
        if(!project.languages) return;

        project.languages.forEach(lang => {
            const isVisible = lang.toLowerCase().includes(value);
            if(isVisible && !projects.includes(project)) {
                projects.push(project);
            }
        })
    });
    
    render_projects(projects);
})