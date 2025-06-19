const express = require("express");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const axios = require("axios");
const path = require("path");

const app = express();
const memoryStore = new session.MemoryStore();

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

const keycloak = new Keycloak(
  { store: memoryStore },
  {
    realm: "carXpage",
    "auth-server-url": "http://localhost:8080",
    "ssl-required": "none",
    resource: "carx-ssr",
    credentials: {
      secret: "sg9xuBlYnx2txA9g7fVT7MWs1NyiCJBA",
    },
    "confidential-port": 0,
  }
);

app.use(keycloak.middleware());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", keycloak.protect(), async (req, res) => {
  try {
    const token = req.kauth.grant.access_token.token;
    console.log("DECODED TOKEN:", req.kauth.grant.access_token.content);
    const response = await axios.get("http://localhost:5000/photos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const photos = response.data;
    res.render("index", { photos, token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Eror fetcing photos");
  }
});

app.get("/logout", (req, res) => {
  const redirectUrl = "http://localhost:3000";
  const logoutUrl = `http://localhost:8080/realms/carXpage/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(
    redirectUrl
  )}`;
  req.session.destroy(() => {
    res.redirect(logoutUrl);
  });
});

app.listen(3000, () => {
  console.log("SSR client running on http://localhost:3000");
});
