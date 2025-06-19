const express = require("express");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const axios = require("axios");
const path = require("path");

const app = express();

const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore }, path.join(__dirname, "./keycloak.json"));

app.use(
  session({
    secret: "ssr_secret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

app.use(keycloak.middleware());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", keycloak.protect(), async (req, res) => {
  try {
    const token = req.kauth.grant.access_token.token;

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
    console.error(err);
    res.status(500).send("Error fetching photos.");
  }
});

app.get("/logout", keycloak.protect(), (req, res) => {
  const redirectUrl = "http://localhost:3000";
  req.session.destroy(() => {
    res.redirect(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout?redirect_uri=${redirectUrl}`);
  });
});


app.listen(3000, () => {
  console.log("SSR Client listening on http://localhost:3000");
});
