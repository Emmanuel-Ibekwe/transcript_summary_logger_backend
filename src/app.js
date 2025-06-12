const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const expressMongoSanitize = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");
const createHttpError = require("http-errors");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth.route.js");
const transcriptRoutes = require("./routes/transcript.route.js");
const xssClean = require("xss-clean");

const app = express();

// Morgan: for http request logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Helmet: to secure express apps by setting various http headers
app.use(helmet());

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.json());
// app.use(express.json());

app.use(expressMongoSanitize());

// app.use(xssClean());
app.use(xss());

app.use(compression());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", transcriptRoutes);

app.use(async (req, res, next) => {
  next(createHttpError.NotFound("This route does not exist."));
});

app.use(async (error, req, res, next) => {
  console.log(error);
  const status = error.status || 500;
  const message = error.message;
  const success = error.success || false;

  res.status(status).json({ success: false, message: message });
});

module.exports = app;
