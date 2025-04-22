import { createRoot } from "https://esm.sh/react-dom@19.1.0/client";
import { useState } from "https://esm.sh/react@19.1.0";

function App() {
  const [msg] = useState("world");
  return <h1>Hello {msg}!</h1>;
}

createRoot(document.getElementById("_BookBar")).render(<App />);
console.log("[BookBar] Loaded!");