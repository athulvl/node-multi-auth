const User = require("../models/UserModel");
const database = require("../config/database");
const bcrypt = require("bcrypt");
const { render } = require("../app");
const { json } = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const jwt = require("jsonwebtoken");
const storage = require("node-sessionstorage");
const userRole = require("../Enums/UserRoles");
const nodemailer = require("nodemailer");
const ejs = require("ejs");

async function register(req) {
  let foundUser = await User.aggregate([
    {
      $match: { email: req.body.email },
    },
    { $skip: 0 },
  ]);
  if (foundUser != "") {
    console.log("user already exist");
    return { status: "error", message: "User already exists" };
  } else {
    const saltRounds = 10;
    const myPlaintextPassword = req.body.password;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(myPlaintextPassword, salt);
    const data = {
      name: req.body.name,
      email: req.body.email,
      password: hash,
      role: userRole.user,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const user = new User(data);
    user.save();
    return { status: "success", message: "user created" };
  }
}

async function login(req) {
  const email = req.body.email;
  const password = req.body.password;
  try {
    let foundUser = await User.aggregate([
      {
        $match: { email: email },
      },
      { $skip: 0 },
    ]);
    if (foundUser.length > 0) {
      if (bcrypt.compareSync(password, foundUser[0].password)) {
        const token = jwt.sign(
          { _id: foundUser[0]._id },
          process.env.JWTPRIVATEKEY
        );
        storage.setItem("token", token);
        storage.setItem("role", foundUser[0].role);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}

async function forgotPassword(req) {
  const email = req.body.email;
  try {
    let foundUser = await User.aggregate([
      {
        $match: { email: email },
      },
      { $skip: 0 },
    ]);
    if (foundUser.length > 0) {
      let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      });
      let html = ejs.renderFile(
        "../views/admin/include/forgot_password_email.ejs",
        {
          username: "testUsername",
        }
      );
      let info = await transporter.sendMail({
        from: '"Admin" <admin@example.com>',
        to: email,
        subject: "Password recovery mail",
        html: "test",
      });
      console.log("email send");
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}

module.exports = {
  register: register,
  login: login,
  forgotPassword: forgotPassword,
};
