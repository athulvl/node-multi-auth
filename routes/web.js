const express = require("express");
const { render, route } = require("../app");
const router = express.Router();
const storage = require("node-sessionstorage");
const auth = require("../config/middleware");
const authenticationController = require("../controller/authenticationController");
const users = require("../models/UserModel");
/* GET users listing. */

router.get("/login", function (req, res, next) {
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
    res.redirect("/");
  } else {
    const response = authenticationController.login(req);
    if (response) {
      res.redirect("/");
    } else {
      res.redirect("/login");
    }
  }
});

router.get("/", auth, function (req, res, next) {
  res.render("admin/index");
});

router.get("/logout", function (req, res, next) {
  storage.removeItem("token");
  res.redirect("/login");
});
module.exports = router;
