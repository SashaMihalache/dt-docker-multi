const keys = require("./keys");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Express Server
const app = express();
app.use(cors());
app.use(bodyParser.json());

// PSQL
const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on("error", () => {
  console.log("Lost PGSQL connection");
});

pgClient
  .query("CREATE TABLE IF NOT EXISTS values (number INT)")
  .catch((err) => console.log(err));

// Redis
const redis = require("redis");
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();

// API

app.get("/", (req, res) => {});

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * from values");

  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    res.send(values);
  });
});

app.post("/values", async (req, res) => {
  const fibIndex = req.body.index;
  if (parseInt(fibIndex) > 40) {
    return res.status(422).send("Fibonacci Index too big");
  }

  redisClient.hset("values", fibIndex, "Calculating...");
  redisPublisher.publish("insert", fibIndex);

  pgClient.query("INSERT INTO values(number) VALUES($1)", [fibIndex]);

  res.send({ working: true });
});

app.listen(5000, (err) => {
  console.log("Listening");
});
