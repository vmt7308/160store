const sql = require("mssql");
require("dotenv").config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: false,
  },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log("Connected to SQL Server!");
    return pool;
  })
  .catch((err) => {
    console.error("Database Connection Failed!", err);
  });

module.exports = {
  sql,
  poolPromise,
};
