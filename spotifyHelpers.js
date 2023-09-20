const axios = require("axios");

const renewSP = require("./spTokenRenew");

const fs = require("fs");

require("dotenv").config();

function getTokenFS() {
  try {
    const data = fs.readFileSync("./spToken.txt", "utf8");
    return data;
  } catch (err) {
    console.error(err);
  }
}

async function getToken() {
  console.log("Attempting to get token 1st time");
  let token = getTokenFS();
  console.log("TOKEN: " + token);
  let headers = {
    Cookie: `sp_dc=${token}`,
  };
  try {
    const response = await axios({
      method: "get",
      url: "https://open.spotify.com/get_access_token",
      headers,
    });
    return response.data.accessToken;
  } catch (error) {
    console.log("Failed to get access token 1st time going to renew SP");
    await renewSP();
  }

  token = getTokenFS();

  console.log("TOKEN2: " + token);
  console.log("Attempting to get token 2nd time");
  headers = {
    Cookie: `sp_dc=${token}`,
  };
  try {
    const response = await axios({
      method: "get",
      url: "https://open.spotify.com/get_access_token",
      headers,
    });
    return response.data.accessToken;
  } catch (error) {
    console.log("Failed to get access token 2nd time going to renew SP");
    throw "Failed to get access token 2nd time";
  }
}

async function getLyrics(URI, token) {
  const url = `https://spclient.wg.spotify.com/color-lyrics/v2/track/${URI}?format=json&vocalRemoval=false`;

  try {
    const response = await axios({
      method: "get",
      url,
      headers: {
        "app-platform": "WebPlayer",
        authorization: `Bearer ${token}`,
      },
    });
    // console.log(response.data.lyrics.lines);

    return response.data.lyrics.lines;
  } catch (error) {
    // console.log(error);
    return [];
  }
}

module.exports = { getToken, getLyrics };
