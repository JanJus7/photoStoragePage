import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initKeycloak } from "./api/auth";

initKeycloak({
  onLoad: "check-sso",
  silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
  checkLoginIframe: false,
  redirectUri: window.location.origin,
}).then(() => {
  const root = document.getElementById("root");
  if (root) {
    ReactDOM.createRoot(root).render(<App />);
  }
});
