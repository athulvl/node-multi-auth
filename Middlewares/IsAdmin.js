const storage = require("node-sessionstorage");

module.exports = (req, res, next) => {
  try {
    if (storage.getItem("role") && storage.getItem("role") == 1) {
      next();
    } else {
      res.render("admin/error/unauthorized");
    }
  } catch (error) {
    res.render("admin/error/unauthorized");
  }
};
