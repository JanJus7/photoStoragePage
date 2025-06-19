import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initKeycloak } from "./api/auth";

initKeycloak({
  onLoad: "check-sso",
  silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
  checkLoginIframe: false,
  redirectUri: window.location.origin,
})
  .then((authenticated) => {
    console.log("Keycloak init success. Authenticated:", authenticated);
    const root = document.getElementById("root");
    if (root) {
      ReactDOM.createRoot(root).render(<App />);
    }
  })
  .catch((err) => {
    console.error("Keycloak init failed:", err);

    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `
        <div style="color: red; padding: 2rem; font-family: sans-serif;">
          <h1>Keycloak auth failed...</h1>
          <p>Nie udało się połączyć z serwerem Keycloak.</p>
          <pre>${err?.toString()}</pre>
        </div>
      `;
    }
  });
