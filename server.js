const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const mogan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar sesión
app.use(
  session({
    secret: "fgp_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Configurar Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/oauth/callback",
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));
app.use(mogan("dev"));

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Profile (HTML)
app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");
  res.sendFile(path.join(__dirname, "public", "profile.html"));
});

// Endpoint JSON con datos del usuario
app.get("/api/user", (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "No autenticado" });
  res.json(req.user);
});

// OAuth
app.get("/api/oauth", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/api/oauth/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) =>
  res.redirect("/profile")
);

// Logout
app.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});
