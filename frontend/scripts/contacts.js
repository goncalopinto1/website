import { showToast } from "./helper-functions.js";

export function sendContacts(){
    let StatusTimeout;

    const form = document.getElementById("contact-form");
    console.log("📋 Form encontrado:", form);
    
    if (!form) {
        console.error("❌ Form não encontrado!");
        return;
    }
    
    form.addEventListener("submit", async (e) => {
        console.log("🚀 Form submetido!");
        e.preventDefault();

        const ok = confirm("Are you sure you want to send this contact message?")
        if(!ok) return;
        
        const data = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            message: document.getElementById("message").value,
        };

        try {
            console.log("📤 Enviando request...");
            
            const res = await fetch("/contact", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            });

            console.log("📥 Response:", res.status, res.ok);

            const status = document.getElementById("status");

            if (res.ok) {
                console.log("✅ Entrou no res.ok");
                showToast('✅ Mensagem enviada com sucesso!');
                form.reset();  
                console.log("✅ Form resetado");
            } else if(res.status === 429) {
                const error = await res.json();
                showToast(error.detail, "error");
                return;
            } else if (res.status === 422){
                const error = await res.json();
                showToast(error.detail, "error");
                return;
            } else {
                console.log("❌ Erro na resposta");
                status.textContent = "Failed to send message";
                status.className = "status error";
            }

            clearTimeout(StatusTimeout);
            StatusTimeout = setTimeout(() => {
                status.className = "status hidden";
            }, 3000);

        } catch (error) {
            console.log("❌ Error:", error);
            const status = document.getElementById("status");
            status.textContent = "Connection error";
            status.className = "status error";
            
            clearTimeout(StatusTimeout);
            StatusTimeout = setTimeout(() => {
                status.className = "status hidden";
            }, 3000);
        }
    });
}