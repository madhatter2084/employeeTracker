const mysql = require("mysql");
const inquirer = require("inquirer");
const connection = mysql.createConnection({
  host: "localhost",
  port: 3030,
  user: "root",
  password: "password",
  database: "employee_db",
});