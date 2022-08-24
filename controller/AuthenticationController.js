const User = require("../models/UserModel");
const database = require("../config/database");
const bcrypt = require("bcrypt");
const { render } = require("../app");
const { json } = require("body-parser");
const MongoClient = require("mongodb").MongoClient;

const jwt = require("jsonwebtoken");
const storage = require("node-sessionstorage");
const userRole = require("../Enums/UserRoles");

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
    if (foundUser) {
      if (bcrypt.compareSync(password, foundUser[0].password)) {
        const token = jwt.sign(
          { _id: foundUser[0]._id },
          process.env.JWTPRIVATEKEY
        );
        storage.setItem("token", token);
      } else {
        return false;
      }
    } else {
      console.log("User not found");
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  register: register,
  login: login,
};
