const fs = require("fs");
function writeToFile(fileName, content) {
  try {
    fs.writeFileSync(fileName, content, { flag: "w+" });
  } catch (err) {
    console.error(err);
  }
}

function readFromFile(fileName) {
  try {
    const data = fs.readFileSync(fileName, "utf8");
    return data;
  } catch (err) {
    console.error(err);
  }
}

module.exports = { writeToFile, readFromFile };
