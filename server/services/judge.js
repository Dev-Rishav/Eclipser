const Docker = require('dockerode');
const docker = new Docker();

async function executeCode(submission) {
  const container = await docker.createContainer({
    Image: 'code-runner',
    Cmd: ['node', 'run.js', submission.language, submission.code],
    HostConfig: {
      AutoRemove: true,
      Memory: 256 * 1024 * 1024, // 256MB limit
      NetworkMode: 'none',
      Binds: [`/tmp/${submission._id}:/app/output`]
    }
  });

  const timeout = setTimeout(async () => {
    await container.stop();
    return { status: 'TLE', time: 0, memory: 0 };
  }, 5000);

  await container.start();
  
  const result = await container.wait();
  clearTimeout(timeout);
  
  // Parse output and return verdict
  // Add detailed resource monitoring here
  return { 
    status: result.StatusCode === 0 ? 'AC' : 'RE',
    time: 1500, // ms
    memory: 120  // MB
  };
}