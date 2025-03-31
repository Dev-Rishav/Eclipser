const amqp = require('amqplib');
const { executeCode } = require('./run-script');

async function startWorker() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await conn.createChannel();
  
  await channel.assertQueue('code-submissions', { durable: true });
  
  channel.prefetch(2); // Process 2 submissions at a time
  console.log('Worker ready to process submissions');

  channel.consume('code-submissions', async (msg) => {
    const submission = JSON.parse(msg.content.toString());
    
    try {
      const result = await executeCode(submission);
      // Send result back to API service
      channel.sendToQueue('submission-results', 
        Buffer.from(JSON.stringify({
          submissionId: submission._id,
          result
        }))
      );
    } catch (error) {
      console.error('Execution failed:', error);
    }
    
    channel.ack(msg);
  });
}

startWorker();