require("dotenv").config();
const connection = require("../configs/db");
const User = require("../models/User");
const Profile = require("../models/Profile");
const misc = require("../helpers/misc");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const QRCode = require("qrcode");
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const redis = require("redis");
const redisClient = redis.createClient();
module.exports = {
  getAllNasabah: async (request, response) => {
    const page = parseInt(request.query.page) || 1;
    const search = request.query.search || "";
    const limit = request.query.limit || 10;
    const sort = request.query.sort || "DESC";
    const sortBy = request.query.sortBy || " 	date_updated";
    const offset = (page - 1) * limit;
    let totalNasabah = 0;
    let totalPage = 0;
    let prevPage = 0;
    let nextPage = 0;
    connection.query(
      `SELECT COUNT(*) as data FROM user WHERE (phone LIKE '%${search}' or name LIKE '%${search}' )`,
      (error, response) => {
        if (error) {
          misc.response(response, 400, true, "Error", error);
        }
        totalNasabah = response[0].data;
        totalPage =
          totalNasabah % limit === 0
            ? totalNasabah / limit
            : Math.floor(totalNasabah / limit + 1);
        prevPage = page === 1 ? 1 : page - 1;
        nextPage = page === totalPage ? totalPage : page + 1;
      }
    );
    User.getAll(offset, limit, sort, sortBy, search)
      .then((result) => {
        const data = {
          status: 200,
          error: false,
          source: "api",
          data: result,
          total_data: Math.ceil(totalNasabah),
          per_page: limit,
          current_page: page,
          total_page: totalPage,
          nextLink: `http://localhost:2010${request.originalUrl.replace(
            "page=" + page,
            "page=" + nextPage
          )}`,
          prevLink: `http://localhost:2010${request.originalUrl.replace(
            "page=" + page,
            "page=" + prevPage
          )}`,
          message: "Success getting all data",
        };
        redisClient.setex(request.originalUrl, 3600, JSON.stringify(data));
        response.status(200).json({
          status: 200,
          error: false,
          source: "api",
          data: result,
          total_data: Math.ceil(totalNasabah),
          per_page: limit,
          current_page: page,
          total_page: totalPage,
          nextLink: `http://localhost:2010${request.originalUrl.replace(
            "page=" + page,
            "page=" + nextPage
          )}`,
          prevLink: `http://localhost:2010${request.originalUrl.replace(
            "page=" + page,
            "page=" + prevPage
          )}`,
          message: "Success getting all data",
        });
      })
      .catch((err) => {
        console.log(err);
        response.status(400).json({
          status: 400,
          error: true,
          message: "Data not Found",
        });
      });
  },
  getAllNasabahByid: (request, response) => {
    const id = request.params.id;
    User.getAllNasabahById(id)
      .then((result) => {
        response.status(200).json({
          status: 200,
          error: false,
          dataShowed: result.length,
          data: result,
          response: "Data loaded",
        });
      })
      .catch((err) => {
        console.log(err);
        response.status(400).json({
          status: 400,
          error: true,
          message: "Failed to get Nasabah with this Id",
          detail: err.message,
        });
      });
  },
  login: async (request, response) => {
    const phone = request.body.phone;
    try {
      const user = await User.login(phone);
      if (user.length === 0) {
        return response
          .status(400)
          .json({ errors: [{ msg: "User not found in our database" }] });
      }
      const payload = {
        user: {
          id: user[0].id,
          phone: user[0].phone,
        },
      };
      const token = await jwt.sign(payload, process.env.JWT_KEY, {
        expiresIn: 360000,
      });

      const data = {
        token,
        id: user[0].id,
        phone: user[0].phone,
        name: user[0].name,
        email: user[0].email,
      };
      misc.response(response, 200, false, "Successfull login", data);
    } catch (error) {
      console.error(error.message);
      misc.response(response, 500, true, "Server error");
    }
  },
  register: async (request, response) => {
    const { name, email, password, role, phone } = request.body;
    const checkEmail = emailRegex.test(email);
    try {
      const user = await User.checkUser(email);
      const user1 = await Profile.checkPhone(phone);
      if (user.length === 0 && user1.length === 0 && checkEmail === true) {
        const salt = await bcrypt.genSalt(10);

        const passwordHash = await bcrypt.hash(password, salt);

        const data = {
          name,
          email,
          password: passwordHash,
          role,
          phone,
        };
        const registered = await User.register(data);

        const dataProfile = {
          user_id: registered.insertId,
          data,
        };
        const payload = {
          user: {
            id: registered.id,
          },
        };
        const userId = await registered.insertId;
        const idUser = await String(userId);
        const qrcode = await QRCode.toDataURL(idUser);

        await User.updateQRCode(qrcode, idUser);

        const token = await jwt.sign(payload, process.env.JWT_KEY, {
          expiresIn: 360000,
        });

        misc.response(response, 200, false, "Successfull register", [
          token,
          dataProfile,
        ]);
      } else {
        return misc.response(
          response,
          500,
          true,
          "User already exists OR wrong email password"
        );
      }
    } catch (error) {
      console.error(error.message);
      misc.response(response, 400, true, "Server error");
    }
  },
};
