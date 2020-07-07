const keys = require("./keys");
const redis = require("redis");

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const redisSub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

redisSub.on("message", (channel, message) => {
  // hash set, key (message), value: fib value
  const fibValue = fib(parseInt(message));
  redisClient.hset("values", message, fibValue);
});

// subscribe to any insert event
redisSub.subscribe("insert");
