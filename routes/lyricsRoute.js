const express = require("express"),
  router = express.Router();

const { getNewAcessToken, getLyrics } = require("../helpers/spotifyHelpers");

const { writeToFile, readFromFile } = require("../helpers/fileHandler");

router.get("/:id", async (req, res) => {
  try {
    const accessToken = readFromFile("./accessToken.txt");
    const lyrics = await getLyrics(req.params.id, accessToken);
    console.log("Got Lyrics with existing token");
    return res.send(JSON.stringify(lyrics));
  } catch (error) {
    console.log("Error getting lyrics", error);
  }
  try {
    console.log("Getting token");
    const token = await getNewAcessToken();
    console.log(token);
    const lyrics = await getLyrics(req.params.id, token);
    console.log(lyrics);
    res.send(JSON.stringify(lyrics));
  } catch (error) {
    console.log(error);
    res.send("Oops! Something went wrong");
  }
});

module.exports = router;
