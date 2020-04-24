const moment = require("moment");
const config = require("../configs/configs");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Transaction = require("../models/Transaction");
const misc = require("../helpers/misc");
const redis = require("redis");
const redisClient = redis.createClient();
module.exports = {
  get_all: async (request, response) => {
    try {
      const data = await Transaction.get_history();
      response.json({ data });
    } catch (error) {
      console.log(error.message);
    }
  },
  get_allbyId: async (request, response) => {
    const id = request.params.id;
    try {
      const data = await Transaction.get_history(id);
      response.json({ data });
    } catch (error) {
      console.log(error.message);
    }
  },
  topUp: async (request, response) => {
    const id = request.params.id;
    const amount = request.body.amount;
    const date = new Date();

    try {
      const data = await User.getAllNasabahById(id);

      result =
        (data[0].amount ? parseInt(data[0].amount) : 0) + parseInt(amount);

      code = `TOP${moment(new Date()).format("DDMMYY")}${Math.floor(
        Math.random() * (999 - 100 + 1) + 100
      )}`;
      const data1 = {
        amount: result,
      };
      const data2 = {
        transaction: "1",
        code,
        date,
        amount: amount,
        recipient: data[0].phone,
      };
      if (data[0].role == "nasabah") {
        await Transaction.top_up_update(data1, id);
        await Transaction.insert_history(data2);
      } else {
        misc.response(response, 500, false, "your not nasabah");
      }

      redisClient.flushdb();
      misc.response(response, 200, false, "Success topUp");
    } catch (error) {
      console.error(error.message);
      misc.response(response, 500, true, error.message);
    }
  },
  transfer: async (request, response) => {
    const id1 = request.params.id1;
    const id2 = request.params.id2;
    const amount = request.body.amount;
    const date = new Date();
    try {
      const pengirim = await User.getAllNasabahById(id1);
      const penerima = await User.getAllNasabahById(id2);

      result =
        (penerima[0].amount ? parseInt(penerima[0].amount) : 0) +
        parseInt(amount);
      result1 =
        (pengirim[0].amount ? parseInt(pengirim[0].amount) : 0) -
        parseInt(amount);
      code = `TRI${moment(new Date()).format("DDMMYY")}${Math.floor(
        Math.random() * (999 - 100 + 1) + 100
      )}`;
      code1 = `TRO${moment(new Date()).format("DDMMYY")}${Math.floor(
        Math.random() * (999 - 100 + 1) + 100
      )}`;
      const penerima3 = {
        amount: result,
      };
      const data2 = {
        transaction: "2",
        code: code,
        date,
        amount: amount,
        recipient: penerima[0].phone,
      };
      const data3 = {
        transaction: "3",
        code: code1,
        date,
        amount: amount,
        recipient: pengirim[0].phone,
      };
      const pengirim4 = {
        amount: result1,
      };
      if (parseInt(pengirim[0].amount) < parseInt(amount)) {
        misc.response(response, 500, false, "your amount is not enough");
      } else {
        await Transaction.insert_history(data2);
        await Transaction.insert_history(data3);

        await Transaction.top_up_update(penerima3, id2);
        await Transaction.top_up_update(pengirim4, id1);
      }

      redisClient.flushdb();
      misc.response(response, 200, false, "Success Transfer");
    } catch (error) {
      console.error(error.message);
      misc.response(response, 500, true, error.message);
    }
  },
};
