const url = "mongodb://localhost:27017/" + process.env.DB_NAME;
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect(url);
