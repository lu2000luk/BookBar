console.log("[BookBar] Loader running...");

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

const appDiv = document.createElement("div");
appDiv.id = "_BookBar";
appDiv.style.position = "fixed";
appDiv.style.zIndex = "9999";
appDiv.style.top = "0px";
appDiv.style.right = "0px";
document.body.appendChild(appDiv);

const appCode = atob("___APP___");
const appScript = document.createElement("script");
appScript.type = "module";
appScript.id = "_BookBarScript";
appScript.textContent = appCode;

const styleSheet = atob("___CSS___");
const style = document.createElement("style");
style.textContent = styleSheet;
document.head.appendChild(style);

document.body.appendChild(appScript);

sessionStorage["bookmarklet_loaded"] = true;
