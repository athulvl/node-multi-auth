const express = require("express");
const { render, route } = require("../app");
const router = express.Router();
const storage = require("node-sessionstorage");
const auth = require("../config/middleware");
const authenticationController = require("../controller/authenticationController");
const users = require("../models/UserModel");
const { forgotPassword } = require("../controller/authenticationController");
/* GET users listing. */

router.get("/login", function (req, res, next) {
  console.log(storage.getItem("role"));
  if (storage.getItem("token")) {
    res.redirect("/");
  } else {
    res.render("admin/login");
  }
});

router.get("/register", function (req, res, next) {
  if (storage.getItem("token")) {
    res.redirect("/");
  } else {
    res.render("admin/register");
  }
});

router.post("/register", function (req, res, next) {
  if (storage.getItem("token")) {
    res.redirect("/");
  } else {
    let responses = null;
    response();
    async function response() {
      responses = await authenticationController.register(req);
      res.json(responses);
    }
  }
});

router.post("/login", async (req, res, next) => {
  if (storage.getItem("token")) {
    res.json(true);
  } else {
    let responses = null;
    loginResponse();
    async function loginResponse() {
      responses = await authenticationController.login(req);
      res.json(responses);
    }
  }
});

router.get("/", auth, function (req, res, next) {
  res.render("admin/index");
});

router.get("/logout", function (req, res, next) {
  storage.removeItem("token");
  storage.removeItem("role");
  res.redirect("/login");
});

router.get("/forgot-password", function (req, res, next) {
  res.render("admin/forgot_password");
});
router.post("/forgot-password", function (req, res, next) {
  forgotPasswordResponse();
  async function forgotPasswordResponse() {
    let responses = await authenticationController.forgotPassword(req);
    res.json(responses);
  }
});
module.exports = router;
