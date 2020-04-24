const connection = require("../configs/db");

module.exports = {
  login: (phone) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM user WHERE phone = ?`,
        phone,
        (error, result) => {
          if (error) {
            reject(new Error(error));
          } else {
            resolve(result);
          }
        }
      );
    });
  },
  updateQRCode: (qrcode, id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE user SET qrcode = ? WHERE id = ?`,
        [qrcode, id],
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            reject(new Error(error));
          }
        }
      );
    });
  },
  register: (data) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO user SET ?", data, (error, result) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(result);
        }
      });
    });
  },
  checkUser: (email) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM user WHERE email = '${email}'`,
        (error, result) => {
          if (error) {
            reject(new Error(error));
          } else {
            resolve(result);
          }
        }
      );
    });
  },
  checkRole: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT role FROM user WHERE id = '${id}'`,
        (error, result) => {
          if (error) {
            reject(new Error(error));
          } else {
            resolve(result);
          }
        }
      );
    });
  },

  getAll: (offset, limit, sort, sortBy, search) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM user WHERE role = "nasabah" AND (phone LIKE '%${search}%' or name LIKE '%${search}%') 
      ORDER BY ${sortBy} ${sort} LIMIT ${offset}, ${limit}`;
      connection.query(query, (error, result) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(result);
        }
      });
    });
  },
  getAllNasabahById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM user WHERE id = ${id}`,
        (error, result) => {
          if (error) {
            reject(new Error(error));
          } else {
            resolve(result);
          }
        }
      );
    });
  },
};
