import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://keycloak:8080/",
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
export const getRoles = () => keycloak.tokenParsed?.realm_access?.roles || [];
export const logout = () =>
  keycloak.logout({ redirectUri: window.location.origin });
export const getEmail = () => keycloak.tokenParsed?.email;

export const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export default keycloak;
