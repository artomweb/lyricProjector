const cors = require("cors");
const session = require("express-session");

require("dotenv").config();
var express = require("express"),
  app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

const lyricsRoute = require("./lyricsRoute");

const AuthRoutes = require("./routes/authRoutes.js");
app.use("/api", cors(), AuthRoutes);

app.use("/lyrics", lyricsRoute);

app.get("/", (req, res) => {
  // console.log("TOKEN:", req.session);
  if (!req.session.access_token) {
    return res.redirect("/api/login");
  }

  res.render("index", { token: req.session.access_token });
});

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`);
});
