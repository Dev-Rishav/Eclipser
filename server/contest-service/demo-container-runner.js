#!/usr/bin/env node

const SimpleContainerRunner = require('./simple-container-runner');

async function demo() {
  console.log('🚀 Simple Container Runner Demo');
  console.log('================================\n');

  const runner = new SimpleContainerRunner();

  // Check Docker availability
  const dockerAvailable = await runner.checkDocker();
  if (!dockerAvailable) {
    console.error('❌ Docker is not available. Please install Docker and try again.');
    process.exit(1);
  }

  try {
    // 1. Create a Python container
    console.log('📦 Step 1: Creating a Python container...');
    const containerName = 'demo-python-container';
    const createResult = await runner.createContainer(containerName, 'python');
    
    if (!createResult.success) {
      throw new Error(`Failed to create container: ${createResult.error}`);
    }

    // Wait a moment for container to be fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Execute some Python code
    console.log('\n🐍 Step 2: Executing Python code...');
    const pythonCode = 'print("Hello from Docker container!")\\nprint("Python version:")\\nimport sys\\nprint(sys.version)';
    const result1 = await runner.executeCode(containerName, pythonCode, 'python');
    
    console.log('Result:', result1.success ? '✅ Success' : '❌ Failed');
    console.log('Output:', result1.output);
    if (result1.error) console.log('Error:', result1.error);

    // 3. Execute code with input
    console.log('\n📝 Step 3: Executing Python code with input...');
    const inputCode = 'name = input("Enter your name: ")\\nage = input("Enter your age: ")\\nprint(f"Hello {name}, you are {age} years old!")';
    const result2 = await runner.executeCode(containerName, inputCode, 'python', 'John\\n25');
    
    console.log('Result:', result2.success ? '✅ Success' : '❌ Failed');
    console.log('Output:', result2.output);
    if (result2.error) console.log('Error:', result2.error);

    // 4. List containers
    console.log('\n📋 Step 4: Listing all containers...');
    await runner.listContainers();

    // 5. Cleanup
    console.log('\n🧹 Step 5: Cleaning up...');
    await runner.stopContainer(containerName);
    await runner.removeContainer(containerName);

    console.log('\n✅ Demo completed successfully!');
    console.log('\n💡 Usage Tips:');
    console.log('- Run `node simple-container-runner.js` for help');
    console.log('- Create containers manually and reuse them for multiple executions');
    console.log('- Each container is isolated with security constraints');
    console.log('- Supports Python, JavaScript, Java, C++, and C');

  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    
    // Cleanup on error
    try {
      console.log('🧹 Attempting cleanup...');
      await runner.removeContainer('demo-python-container');
    } catch (cleanupError) {
      console.warn('⚠️ Cleanup failed:', cleanupError.message);
    }
  }
}

// Test different languages
async function testAllLanguages() {
  console.log('🌐 Testing All Supported Languages');
  console.log('==================================\n');

  const runner = new SimpleContainerRunner();
  
  const testCases = [
    {
      language: 'python',
      code: 'print("Hello from Python!")',
      expectedOutput: 'Hello from Python!'
    },
    {
      language: 'javascript', 
      code: 'console.log("Hello from JavaScript!");',
      expectedOutput: 'Hello from JavaScript!'
    },
    {
      language: 'java',
      code: 'public class Solution { public static void main(String[] args) { System.out.println("Hello from Java!"); } }',
      expectedOutput: 'Hello from Java!'
    },
    {
      language: 'cpp',
      code: '#include<iostream>\\nint main() { std::cout << "Hello from C++!" << std::endl; return 0; }',
      expectedOutput: 'Hello from C++!'
    },
    {
      language: 'c',
      code: '#include<stdio.h>\\nint main() { printf("Hello from C!\\n"); return 0; }',
      expectedOutput: 'Hello from C!'
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`🔧 Testing ${testCase.language.toUpperCase()}...`);
      
      const containerName = `test-${testCase.language}-container`;
      
      // Create container
      const createResult = await runner.createContainer(containerName, testCase.language);
      if (!createResult.success) {
        console.log(`❌ Failed to create ${testCase.language} container: ${createResult.error}`);
        continue;
      }

      // Wait for container to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Execute code
      const result = await runner.executeCode(containerName, testCase.code, testCase.language);
      
      console.log(`   Result: ${result.success ? '✅' : '❌'}`);
      console.log(`   Output: ${result.output.trim()}`);
      if (result.error) console.log(`   Error: ${result.error}`);
      console.log(`   Time: ${result.executionTime}ms\n`);

      // Cleanup
      await runner.removeContainer(containerName);

    } catch (error) {
      console.log(`❌ ${testCase.language} test failed: ${error.message}\n`);
    }
  }
}

// Run demo or language tests based on argument
const arg = process.argv[2];
if (arg === 'test') {
  testAllLanguages().catch(console.error);
} else {
  demo().catch(console.error);
}
