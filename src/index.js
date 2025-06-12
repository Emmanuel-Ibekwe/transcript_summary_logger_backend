const mongoose = require("mongoose");
const app = require("./app.js");
const dotenv = require("dotenv");
const config = require("./config");

dotenv.config();

const PORT = process.env.PORT || 8000;

mongoose
  .connect(config.databaseUrl)
  .then(() => {
    console.log("Connected to Mongodb");
    console.log("process.env", process.env.NODE_ENV);
  })
  .catch((err) => {
    console.log(`Mongo connection error: ${err}`);
    process.exit(1);
  });

let server;
server = app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
