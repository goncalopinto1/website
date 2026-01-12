let StatusTimeout;

document
    .getElementById("contact-form")
    .addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            message: document.getElementById("message").value,
        };

        //my backend runs simustaneasly in the port 8000
        const res = await fetch("http://localhost:8000/contact", {
            method: "POST", // sets the type of api request
            headers: {"Content-Type": "application/json" }, // says what is the data type in this case json
            body: JSON.stringify(data), // transforms by object to a json string
        });

        const status = document.getElementById("status");
        status.textContent = "Message received";
        status.className = "status success";

        clearTimeout(StatusTimeout);

        StatusTimeout = setTimeout(() => {
            status.className = "status hidden";
        }, 3000);
    });
