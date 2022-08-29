const User = require("../models/UserModel");
const database = require("../config/database");
const bcrypt = require("bcrypt");
const { render } = require("../app");
const { json } = require("body-parser");

const { MongoClient, ObjectID } = require("mongodb");

const jwt = require("jsonwebtoken");
const storage = require("node-sessionstorage");
const userRole = require("../Enums/UserRoles");
const nodemailer = require("nodemailer");
var fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const { v4: uuidv4 } = require("../node_modules/uuid");

async function register(req) {
  let foundUser = await User.aggregate([
    {
      $match: { email: req.body.email },
    },
    { $skip: 0 },
  ]);
  if (foundUser != "") {
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

async function forgotPasswordMail(req) {
  let random_string = uuidv4();
  const email = req.body.email;
  try {
    let foundUser = await User.aggregate([
      {
        $match: { email: email },
      },
      { $skip: 0 },
    ]);

    if (foundUser.length > 0) {
      const query = { email: email };
      const update = { $set: { reset_password: random_string } };
      const options = { upsert: true };
      await User.updateOne(query, update, options);
      let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      });
      const emailTemplatePath =
        "../views/admin/include/forgot_password_email.html";
      const templatePath = path.join(__dirname, emailTemplatePath);
      const source = fs.readFileSync(templatePath, "utf-8").toString();
      const template = handlebars.compile(source);
      const replacements = {
        password_reset_link:
          process.env.APP_URL + "reset-password?id=" + random_string,
      };
      const finalHtml = template(replacements);
      let info = await transporter.sendMail({
        from: '"Admin" <admin@example.com>',
        to: email,
        subject: "Password recovery mail",
        html: finalHtml,
      });
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}

async function getResetPasswordPage(req) {
  const resetPasswordId = req.query.id;
  try {
    let foundUser = await User.aggregate([
      {
        $match: { reset_password: resetPasswordId },
      },
      { $skip: 0 },
    ]);
    if (foundUser.length > 0) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

async function resetPassword(req) {
  const resetPasswordId = req.body.reset_password_id;
  try {
    let foundUser = await User.aggregate([
      {
        $match: { reset_password: resetPasswordId },
      },
      { $skip: 0 },
    ]);
    if (foundUser.length > 0) {
      const saltRounds = 10;
      const myPlaintextPassword = req.body.password;
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(myPlaintextPassword, salt);
      const query = { reset_password: resetPasswordId };
      const update = { $set: { password: hash, reset_password: "" } };
      const options = { upsert: true };
      await User.updateMany(query, update, options);
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
  forgotPasswordMail: forgotPasswordMail,
  resetPasswordPage: getResetPasswordPage,
  resetPassword: resetPassword,
};
