const script = atob("___SCRIPT___");

const scriptTag = document.createElement("script");
scriptTag.type = "module"; // Correct type for the injected script.js content
scriptTag.textContent = script;
document.body.appendChild(scriptTag);
sessionStorage.setItem("bookmarklet_loaded", "true");