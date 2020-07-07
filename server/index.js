const keys = require("./keys");

// Express Server setup

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup

const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on("error", () => console.log("Lost PG connection"));

pgClient
  .query("CREATE TABLE IF NOT EXISTS values(number INT)")
  .catch(console.log);

// Redis Client Setup

const redis = require("redis");
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

// Routes Setup

app.get("/", (req, res) => {
  res.send("hi.");
});

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * from values");
  console.log("Fetched from DB", values);

  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    console.log("Fetched from Redis", values);
    res.send(values);
  });
});

app.post("/values", async (req, res) => {
  const { index } = req.body;

  if (parseInt(index) > 40) {
    return res.status(422).send("Index too big.");
  }

  redisClient.hset("values", index, "Calculating it...");
  redisPublisher.publish("insert", index);

  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({ working: true });
});

app.listen(5000, (err) => {
  console.log("Server is listening...");
});
