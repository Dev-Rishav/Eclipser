const amqp = require('amqplib');

let channel;

async function connectQueue() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await conn.createChannel();
  await channel.assertQueue('code-submissions');
}

async function addToQueue(submission) {
  channel.sendToQueue('code-submissions', 
    Buffer.from(JSON.stringify(submission)));
}

module.exports = { connectQueue, addToQueue };