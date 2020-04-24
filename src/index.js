const express = require("express");
const auth = require("./routes/auth");
const profile = require("./routes/profile");
const transaction = require("./routes/transaction");
const Route = express.Router();

Route.use("/api/v1/auth", auth);
Route.use("/api/v1/profile", profile);
Route.use("/api/transaction", transaction);

module.exports = Route;
