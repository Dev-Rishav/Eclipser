const Docker = require('dockerode');
const docker = new Docker();

async function executeCode(submission) {
  const container = await docker.createContainer({
    Image: 'python:3.9-slim', // Base image per language
    Cmd: ['python', '-c', submission.code],
    HostConfig: {
      AutoRemove: true,
      Memory: 256 * 1024 * 1024, // 256MB limit
      NetworkMode: 'none',
      Binds: [`/tmp/${submission._id}:/app`]
    }
  });

  const timeout = setTimeout(async () => {
    await container.stop();
    return { status: 'TLE', time: 0, memory: 0 };
  }, 5000);

  const start = Date.now();
  await container.start();
  
  const stream = await container.logs({ follow: true, stdout: true, stderr: true });
  let output = '';
  stream.on('data', (chunk) => output += chunk.toString());
  
  await container.wait();
  clearTimeout(timeout);
  
  return {
    status: output.includes('ERROR') ? 'RE' : 'AC',
    time: Date.now() - start,
    memory: 0, // Add actual memory measurement
    output
  };
}

module.exports = { executeCode };