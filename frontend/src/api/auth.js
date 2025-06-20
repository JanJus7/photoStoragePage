import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080",
  realm: "carXpage",
  clientId: "carx-spa",
});

export const initKeycloak = (options = {}) =>
  keycloak.init({
    checkLoginIframe: false,
    redirectUri: window.location.origin,
    ...options,
  });

export const getToken = () => keycloak.token;

export const logout = () =>
  keycloak.logout({ redirectUri: window.location.origin });

export const getEmail = () => keycloak.tokenParsed?.email;

export const authHeader = () => {
  const token = getToken();
  console.log("Current token:", token);
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getClientRoles = () => {
  console.log("Parsed token in getClientRoles:", keycloak.tokenParsed);
  return keycloak.tokenParsed?.resource_access?.["carx-spa"]?.roles || [];
};

export default keycloak;
