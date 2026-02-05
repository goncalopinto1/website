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
    
    container.innerHTML = ""; 
    
    projects.forEach((p) => {
        const projectPage = document.createElement("div");
        projectPage.className = "project-page";
        
        const imageSection = document.createElement("div");
        imageSection.className = "project-image-container";
        
        const img = document.createElement("img");
        img.className = "project images";
        img.src = p.image_url || "../../docs/images/gif.png"; 
        img.alt = p.name;
        
        const githubLink = document.createElement("a");
        githubLink.href = p.url;
        githubLink.target = "_blank";
        githubLink.className = "github-link";
        githubLink.innerHTML = `
            <img src="../../docs/images/github logo.png" alt="GitHub" class="github-icon">
            <span>See on GitHub</span>
        `;
        
        imageSection.appendChild(img);
        imageSection.appendChild(githubLink);
        
        // Info à direita
        const infoSection = document.createElement("div");
        infoSection.className = "project-info-container";
        
        const title = document.createElement("h2");
        title.className = "project title";
        title.textContent = p.name;
        
        const description = document.createElement("p");
        description.className = "project description";
        description.textContent = p.description;
        
        
        const languagesTags = document.createElement("div");
        languagesTags.className = "languages-tags";
        if (p.languages && p.languages.length > 0) {
            p.languages.forEach(lang => {
                const tag = document.createElement("span");
                tag.className = "language-tag";
                tag.textContent = lang;
                languagesTags.appendChild(tag);
            });
        }
        
        infoSection.appendChild(title);
        infoSection.appendChild(description);
        infoSection.appendChild(languagesTags);
        
        projectPage.appendChild(imageSection);
        projectPage.appendChild(infoSection);
        
        container.appendChild(projectPage);
    });
}