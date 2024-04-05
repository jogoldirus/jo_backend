const mysql = require('mysql2');
class Database {
  constructor(config) {
    this.pool = mysql.createPool(config);
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, args, (err, rows) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.pool.end(err => {
        if (err)
          return reject(err);
        resolve();
      });
    });
  }
}
const db = new Database({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : '',
  database: process.env.DB_DATABASE,
})

module.exports = { db };
