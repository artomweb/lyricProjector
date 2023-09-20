const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const querystring = require("querystring");
const request = require("request");

// this can be used as a seperate module
const encodeFormData = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
};

router.get("/login", async (req, res) => {
  const scope = `
      user-read-email
      user-read-private
      streaming`;

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REDIRECTURI,
      })
  );
});

router.get("/logged", async (req, res) => {
  const body = {
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: process.env.REDIRECTURI,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  };

  await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: encodeFormData(body),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      req.session.access_token = data.access_token;
      req.session.refresh_token = data.refresh_token;
      console.log(req.session);
      res.redirect("/");
    });
});

router.get("/refresh_token", async (req, res) => {
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer.from(
          process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
        ).toString("base64"),
      cache: "no-cache",
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: req.session.refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log(body);
      var access_token = body.access_token;
      req.session.access_token = access_token;
      console.log(access_token);
      res.json({
        access_token: access_token,
      });
    }
  });
});

module.exports = router;
