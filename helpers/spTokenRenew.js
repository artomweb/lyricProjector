const puppeteer = require("puppeteer");

const { writeToFile } = require("./fileHandler");

async function getSP() {
  console.log("starting browser");
  const browser = await puppeteer.launch({
    headless: "new",
  });
  const page = await browser.newPage();
  await page.goto(
    "https://accounts.spotify.com/en-GB/login?continue=https%3A%2F%2Fopen.spotify.com%2F"
  );
  await page.type("#login-username", process.env.spot_u);
  await page.type("#login-password", process.env.spot_p);
  await page.click("#login-button");

  await page.waitForNavigation();

  const cookies = await page.cookies();
  console.log(cookies);

  await browser.close();

  let sp_dc = cookies.find((o) => o.name === "sp_dc");

  if (typeof sp_dc === "undefined") {
    console.log("could not find sp_dc cookie");
    throw "could not find sp_dc cookie";
  }

  //   console.log(sp_dc.value);

  writeToFile("./spToken.txt", sp_dc.value);
}

module.exports = getSP;
