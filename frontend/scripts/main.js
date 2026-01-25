import { loadProject } from "./projects.js";
import { sendContacts } from "./contacts.js";
document.addEventListener("DOMContentLoaded", () => {
    loadProject();
    sendContacts();
});