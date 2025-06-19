const express = require("express");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const app = express();

const KEYCLOAK_URL = "http://keycloak:8080";
const REALM = "carXpage";

const memoryStore = new session.MemoryStore();

const keycloakRawConfig = fs.readFileSync(
  path.join(__dirname, "keycloak.json"),
  "utf8"
);
const keycloakParsed = JSON.parse(keycloakRawConfig);
keycloakParsed["auth-server-url"] = "http://proxy";


const keycloak = new Keycloak({ store: memoryStore }, keycloakParsed);

app.set("trust proxy", true);

app.use(
  session({
    secret: "ssr_secret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(keycloak.middleware());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", keycloak.protect(), async (req, res) => {
  try {
    const token = req.kauth.grant.access_token.token;

    const decoded = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf-8")
    );
    console.log(">>> SSR Access Token decoded:\n", JSON.stringify(decoded, null, 2));

    const photosRes = await axios.get("http://backend:5000/photos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.render("index", {
      user: req.kauth.grant.id_token.content,
      photos: photosRes.data,
    });
  } catch (err) {
    console.error("SSR error:", err.response?.data || err.message);
    res.status(500).send("Error fetching photos.");
  }
});

app.use("/uploads", keycloak.protect(), async (req, res) => {
  const url = `http://backend:5000${req.originalUrl}`;
  try {
    const token = req.kauth.grant.access_token.token;

    const response = await axios.get(url, {
      responseType: "stream",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "application/octet-stream"
    );
    if (response.headers["content-length"]) {
      res.setHeader("Content-Length", response.headers["content-length"]);
    }

    response.data.pipe(res);
  } catch (error) {
    console.error("Proxy /uploads error:", error.message);
    res.status(500).send("Failed to load file.");
  }
});

app.get("/logout", keycloak.protect(), (req, res) => {
  const redirectUrl = req.protocol + "://" + req.headers.host;
  req.session.destroy(() => {
    res.redirect(
      `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout?redirect_uri=${redirectUrl}`
    );
  });
});

app.listen(3000, () => {
  console.log("SSR Client listening on http://localhost:3000");
});
