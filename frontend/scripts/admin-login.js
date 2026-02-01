import { showToast } from "./helper-functions.js";
const form = document.getElementById("admin-login");
console.log("Form found:", form);

if (form) {
    form.addEventListener("submit", async (e) => {
        console.log("Form submitted!");
        e.preventDefault();
        
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        console.log("Email:", email);
        console.log("Password:", password ? "***" : "empty");
        
        // OAuth2 needs this specific format
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        
        try {
            console.log("Sending request...");
            const res = await fetch("http://localhost:8000/admin/login", {
                method: "POST",
                body: formData
            });
            
            console.log("Response status:", res.status);
            
            if (res.ok) {
                const data = await res.json();
                const token = data.access_token;
                
                console.log("Token received!");
                localStorage.setItem("token", token);
                
                window.location.href = "../pages/admin.html";
            } else {
                showToast("Wrong email or password ❌", "error");
            }
        } catch (error) {
            console.log("Error:", error);
            showToast("Something went wrong ❌", "error");
            return;
        }
    });
} else {
    console.log("Form NOT found!");
}
