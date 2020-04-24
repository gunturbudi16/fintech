const connection = require("../configs/db");

module.exports = {
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
  checkPhone: (phone) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT phone FROM user WHERE phone = '${phone}'`,
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
  checkBalance: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT balance FROM user WHERE id = '${id}'`,
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
  detailUser: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM user WHERE id = '${id}'`,
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

  updateEmail: (email, id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE  user  SET  email = '${email}' WHERE id = ${id}`,
        [email, id],
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
  updatePhone: (phone, id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE  user  SET  phone = '${phone}' WHERE id = ${id}`,
        [phone, id],
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

  updateName: (name, id) => {
    let query = `UPDATE  user  SET  name = '${name}' WHERE id = ${id}`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(result);
        }
      });
    });
  },

  deleteUser: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM user WHERE id = '${id}'`,
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

  uploadUser: (filename, id) => {
    let query = `UPDATE user SET photo = '${filename}' WHERE id = ${id}`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(result);
        }
      });
    });
  },
};
