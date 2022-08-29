const createError = require("http-errors");
const express = require("express");
require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const webRouter = require("./routes/web");
const bodyParser = require("body-parser");
const app = express();
const auth = require("./config/middleware");
const session = require("express-session");
app.locals.assetUrl = process.env.ASSET_URL;
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", webRouter);
app.use(session({ secret: "keyboard cat", cookie: { maxAge: 60000 } }));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//port settings
const PORT = process.env.PORT || 3000;
app.listen(PORT, function (err) {
  if (err) console.log("Error in server setup");
  console.log("Server listening on Port", PORT);
});
module.exports = app;
