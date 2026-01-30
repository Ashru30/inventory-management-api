const express = require("express");
const serverless = require("serverless-http");
const mysql = require("mysql2/promise");
const AWS = require("aws-sdk");

const app = express();
app.use(express.json());

/* ==============================
   Get DB Secret (Lazy Load)
================================ */
async function getDbSecret() {
  const secretId = process.env.SECRET_ID;
  if (!secretId) {
    throw new Error("SECRET_ID missing");
  }

  const secretsManager = new AWS.SecretsManager({
    region: process.env.REGION,
  });

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
   HEALTH CHECK (NO DB)
================================ */
app.get("/healthz", (req, res) => {
  res.status(200).json({
    Status: 200,
    Message: "Server is up and running.",
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
   PRODUCT API
================================ */
app.get("/product", async (req, res) => {
  let conn;
  try {
    conn = await getDbConnection();
    const [rows] = await conn.execute("SELECT * FROM products");


    res.json({
      message: "Product API working",
      databases: rows,
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

module.exports.handler = serverless(app);
res.json({ message: "CI/CD working successfully" });

