import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 🔥 FORCE FIREBASE TO LOAD
import "./firebase";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 🔥 REGISTER SERVICE WORKER
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("✅ PWA Service Worker Registered"))
      .catch((err) => console.error("❌ SW registration failed", err));
  });
}
