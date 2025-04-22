import { createRoot } from "https://esm.sh/react-dom@19.1.0/client";
import { useState } from "https://esm.sh/react@19.1.0";

function App() {
  return <div className="_BookBar__Bar">
    <input type="text" name="Query" id="query" className="_BookBar__Input" />
  </div>;
}

createRoot(document.getElementById("_BookBar")).render(<App />);
console.log("[BookBar] Loaded!");