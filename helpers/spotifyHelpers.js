const axios = require("axios");

const renewSP = require("./spTokenRenew");

const { readFromFile, writeToFile } = require("./fileHandler");

require("dotenv").config();

async function getNewAcessToken() {
  console.log("Attempting to get token 1st time");
  let token = readFromFile("./spToken.txt");
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
    const accessToken = response.data.accessToken;
    writeToFile("./accessToken.txt", accessToken);
    return accessToken;
  } catch (error) {
    console.log("Failed to get access token 1st time going to renew SP");
    await renewSP();
  }

  token = readFromFile("./spToken.txt");

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
    console.log(response.data);

    return response.data.lyrics;
  } catch (error) {
    console.log(error);
    if (error.response.status === 404) {
      return [];
    }
    throw "Invalid Access Token";
    // return [];
  }
}

module.exports = { getNewAcessToken, getLyrics };
