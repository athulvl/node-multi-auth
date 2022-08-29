const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
// create an schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    reset_password: {
      type: String,
      required: false,
    },
    created_at: {
      type: Date,
    },
    updated_at: {
      type: Date,
    },
  },
  { collation: { locale: "en_US", strength: 1 } }
);

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY);
};

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
