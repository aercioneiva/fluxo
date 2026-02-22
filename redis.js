const Redis = require('ioredis');

const redisOptions = {
   port: process.env.REDIS_PORT || 6379,
   host: process.env.REDIS_HOST || 'localhost',
   username: process.env.REDIS_USER,
   password: process.env.REDIS_PASS,
   db: process.env.REDIS_DB || 0,
   maxRetriesPerRequest: null,
   retryStrategy: function (times) {
      return Math.max(Math.min(Math.exp(times), 20000), 1000);
   },
   connectTimeout: 10000,
   lazyConnect: true
};

const client = new Redis(redisOptions);

client.on('error', function(error){
   console.log('Redis connection error:');
});

client.on('connect', function(){
   console.log('Redis connected successfully');
});

client.on('ready', function(){
   console.log('Redis is ready to receive commands');
});

client.on('close', function(){
   console.log('Redis connection closed');
});

client.on('reconnecting', function(){
   console.log('Redis reconnecting...');
});

// Test connection on startup
client.connect().catch(error => {
   console.log('Failed to connect to Redis:');
});

module.exports = client;
