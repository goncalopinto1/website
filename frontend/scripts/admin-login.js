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
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);
        
        try {
            console.log("Sending request...");
            const res = await fetch("/admin/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'  
            },
            body: params.toString()  
        });
            
            console.log("Response status:", res.status);
            
            if (res.ok) {
                const data = await res.json();
                const token = data.access_token;
                
                console.log("Token received!");
                localStorage.setItem("token", token);
                
                window.location.href = "/admin";
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
