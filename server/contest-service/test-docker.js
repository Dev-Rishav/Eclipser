const DockerExecutor = require('./src/services/dockerExecutor');

async function testDockerCheck() {
  console.log('🧪 Testing Docker availability check...');
  
  const dockerExecutor = new DockerExecutor();
  
  try {
    const available = await dockerExecutor.checkDockerAvailability();
    console.log('✅ Docker available:', available);
    
    // Let's also manually test the executeWithTimeout method
    const result = await dockerExecutor.executeWithTimeout('docker --version', '', 5000);
    console.log('📋 Manual test result:', {
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
      timedOut: result.timedOut
    });
    
  } catch (error) {
    console.error('❌ Error testing Docker:', error);
  }
}

testDockerCheck();
