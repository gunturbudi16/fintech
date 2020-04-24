const express = require("express");
const Transaction = require("../controllers/transaction");
const Route = express.Router();

Route.get("/getHistory", Transaction.get_all)
  .get("/getHistory/:id", Transaction.get_all)
  .patch("/topUp/:id", Transaction.topUp)
  .patch("/transfer/:id1/:id2", Transaction.transfer);

// .post('/postTransactionOut/:id',Transaction.transactionOut)
// .post('/postTopUp/:id',Transaction.topUp)

module.exports = Route;
