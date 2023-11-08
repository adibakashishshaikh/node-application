const { Client } = require("pg");
const client = new Client({
  host: process.env.HOST,
  user: process.env.USER,
  port: Number(process.env.PORT),
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  type: process.env.TYPE,
});

module.exports = client;
