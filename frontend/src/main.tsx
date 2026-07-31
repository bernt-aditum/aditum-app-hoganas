import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initTheme } from "./theme";
import "./render.css";
import "./styles.css";

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
