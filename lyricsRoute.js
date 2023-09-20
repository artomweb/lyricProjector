const express = require("express"),
  router = express.Router();

const { getToken, getLyrics } = require("./spotifyHelpers");

router.get("/:id", async (req, res) => {
  try {
    console.log("Getting token");
    const token = await getToken();
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
