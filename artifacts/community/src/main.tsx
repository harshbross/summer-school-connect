import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);

const apiUrl = import.meta.env.VITE_API_URL;

if (apiUrl) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById("root")!).render(<App />);