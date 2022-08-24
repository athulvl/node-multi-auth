const jwt = require("jsonwebtoken");
const storage = require("node-sessionstorage");
module.exports = (req, res, next) => {
  try {
    const token = req.header("x-auth-token") || storage.getItem("token");
    if (!token) return res.render("admin/register");

    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};
