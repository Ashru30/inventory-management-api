const express = require("express");
const serverless = require("serverless-http");
const mysql = require("mysql2/promise");
const AWS = require("aws-sdk");

const app = express();
app.use(express.json());

/* ==============================
   AWS Secrets Manager
================================ */
const secretsManager = new AWS.SecretsManager({
  region: process.env.REGION,
});

async function getDbSecret() {
  const secretId = process.env.SECRET_ID;

  if (!secretId) {
    throw new Error("SECRET_ID environment variable is missing");
  }

  const data = await secretsManager
    .getSecretValue({ SecretId: secretId })
    .promise();

  return JSON.parse(data.SecretString);
}

/* ==============================
   MySQL Connection
================================ */
async function getDbConnection() {
  const secret = await getDbSecret();

  return mysql.createConnection({
    host: process.env.HOST,
    user: secret.username,
    password: secret.password,
    database: process.env.DATABASE,
    port: process.env.DB_PORT || 3306,
  });
}

/* ==============================
   Health Check (NO DB)
================================ */
app.get("/healthz", async (req, res) => {
  return res.status(200).json({
    status: 200,
    message: "Server is up and running.",
  });
});

/* ==============================
   USER API (DB REQUIRED)
================================ */
app.get("/user", async (req, res) => {
  let conn;
  try {
    conn = await getDbConnection();

    const [rows] = await conn.execute(
      "SELECT id, name, email FROM users"
    );

    res.status(200).json({
      message: "Users fetched successfully",
      users: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "DB error",
      details: err.message,
    });
  } finally {
    if (conn) await conn.end();
  }
});

/* ==============================
   PRODUCT API (DB REQUIRED)
================================ */
app.get("/product", async (req, res) => {
  let connection;
  try {
    connection = await getDbConnection();

    const [rows] = await conn.execute("SELECT * FROM products");


    res.status(200).json({
      message: "Product API working",
      databases: rows,
    });
  } catch (err) {
    console.error("PRODUCT API ERROR:", err);
    res.status(500).json({
      error: "Database error",
      details: err.message,
    });
  } finally {
    if (connection) await connection.end();
  }
});

/* ==============================
   Lambda Handler
================================ */
module.exports.handler = serverless(app);
res.json({ message: "CI/CD working successfully" });

