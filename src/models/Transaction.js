const connection = require("../configs/db");

module.exports = {
  get_history: () => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT a.transaction, a.code, a.date, a.amount, b.phone FROM transaction_histories a INNER JOIN user b ON a.recipient = b.phone`,
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
  get_historybyId: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT a.transaction, a.code, a.date, a.amount, b.phone FROM transaction_histories a INNER JOIN user b ON a.recipient = b.phone AND b.id =${id} `,
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
  top_up_update: (data, id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE user SET amount = '${data.amount}' WHERE id=${id}`,
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

  insert_history: (data) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `INSERT INTO transaction_histories SET ?`,
        data,
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
