console.log("[BookBar] Loader running...");

// Clean up any previous instances
if (sessionStorage["bookmarklet_loaded"]) {
  const oldScript = document.getElementById("_BookBarScript");
  if (oldScript) {
    oldScript.remove();
  }
  const oldAppDiv = document.getElementById("_BookBar");
  if (oldAppDiv) {
    oldAppDiv.remove();
  }
}

// Create app container
const appDiv = document.createElement("div");
appDiv.id = "_BookBar";
appDiv.style.position = "fixed";
appDiv.style.zIndex = "9999";
appDiv.style.top = "10px";
appDiv.style.right = "10px";
document.body.appendChild(appDiv);

// Inject pre-compiled app code as a module script
const appCode = atob("___APP___"); // This now contains compiled JS
const appScript = document.createElement("script");
appScript.type = "module"; // Standard module script
appScript.id = "_BookBarScript";
appScript.textContent = appCode;
document.body.appendChild(appScript); // Append to body

const styleSheet = atob("___CSS___"); // This now contains compiled CSS

// Mark as loaded
sessionStorage["bookmarklet_loaded"] = true;
