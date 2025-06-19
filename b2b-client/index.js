const axios = require("axios");

const KEYCLOAK_URL = "http://keycloak:8080";
const REALM = "carXpage";
const CLIENT_ID = "carx-b2b";
const CLIENT_SECRET = "Zkh1PQHHPQ8SSe3nGivNHjS9fdklQoCR";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function waitForKeycloak(retries = 10) {
  const url = `${KEYCLOAK_URL}/realms/${REALM}`;
  for (let i = 0; i < retries; i++) {
    try {
      await axios.get(url);
      console.log("Keycloak is ready.");
      return;
    } catch (err) {
      console.log(`Waiting for Keycloak... (${i + 1}/${retries})`);
      await sleep(3000);
    }
  }
  throw new Error("Keycloak did not become available.");
}

async function getAccessToken() {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);

  const res = await axios.post(
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
    params
  );

  return res.data.access_token;
}

async function callProtectedAPI() {
  try {
    const token = await getAccessToken();

    const res = await axios.get("http://backend:5000/photos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("API response:", res.data);
  } catch (err) {
    console.error("API error:", err.response?.data || err.message);
  }
}

(async () => {
  try {
    await waitForKeycloak();
    await callProtectedAPI();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();
