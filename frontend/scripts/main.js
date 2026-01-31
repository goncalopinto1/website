import { loadProject } from "./projects.js";
import { sendContacts } from "./contacts.js";
import { initPosts } from "./posts.js";

document.addEventListener("DOMContentLoaded", () => {
    loadProject();
    sendContacts();
    initPosts();
});