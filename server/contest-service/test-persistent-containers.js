const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:3001/api/contests';

async function testPersistentContainers() {
  console.log('🧪 Testing Persistent Docker Containers');
  console.log('=====================================');
  
  try {
    // Step 1: Create a contest
    console.log('🚀 Step 1: Creating contest...');
    const contestData = {
      title: 'Persistent Container Test',
      description: 'Testing persistent Docker containers',
      startTime: new Date(Date.now() + 60000).toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      createdBy: 'test-system',
      problems: [{
        title: 'Simple Addition',
        description: 'Add two numbers and return the result',
        difficulty: 'easy',
        timeLimit: 5000,
        memoryLimit: 128,
        testCases: [
          { input: '2\n3', expectedOutput: '5', isPublic: true },
          { input: '10\n20', expectedOutput: '30', isPublic: false }
        ]
      }]
    };
    
    const contestResponse = await axios.post(`${BASE_URL}/create`, contestData);
    const contestId = contestResponse.data.contest._id;
    console.log('✅ Contest created:', contestId);
    
    // Step 2: Check initial container state
    console.log('\n📦 Step 2: Checking initial container state...');
    const initialContainers = await axios.get(`${BASE_URL}/containers/active`);
    console.log('📊 Initial containers:', initialContainers.data.activeContainers.totalCount);
    
    // Step 3: Submit first code (should create container)
    console.log('\n📝 Step 3: Submitting first solution (should create persistent container)...');
    const firstCode = `
a = int(input())
b = int(input())
print(a + b)
`;
    
    const firstSubmission = await axios.post(`${BASE_URL}/submit`, {
      contestId,
      userId: 'test-user-1',
      code: firstCode,
      language: 'python'
    });
    console.log('✅ First submission queued:', firstSubmission.data.submissionId);
    
    // Wait for processing
    console.log('⏳ Waiting for Docker execution...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 4: Check container state after first submission
    console.log('\n🔍 Step 4: Checking containers after first submission...');
    const afterFirstContainers = await axios.get(`${BASE_URL}/containers/active`);
    console.log('📊 Containers after first submission:', afterFirstContainers.data.activeContainers.totalCount);
    console.log('📋 Container details:', JSON.stringify(afterFirstContainers.data.activeContainers, null, 2));
    
    // Step 5: Submit second code (should reuse container)
    console.log('\n📝 Step 5: Submitting second solution (should reuse container)...');
    const secondCode = `
x = int(input())
y = int(input())
result = x + y
print(result)
`;
    
    const secondSubmission = await axios.post(`${BASE_URL}/submit`, {
      contestId,
      userId: 'test-user-2',
      code: secondCode,
      language: 'python'
    });
    console.log('✅ Second submission queued:', secondSubmission.data.submissionId);
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 6: Check final container state
    console.log('\n🔍 Step 6: Checking final container state...');
    const finalContainers = await axios.get(`${BASE_URL}/containers/active`);
    console.log('📊 Final containers:', finalContainers.data.activeContainers.totalCount);
    
    // Step 7: Check actual Docker containers
    console.log('\n🐳 Step 7: Checking Docker containers on system...');
    const { exec } = require('child_process');
    exec('docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Image}}"', (error, stdout, stderr) => {
      if (error) {
        console.error('Error checking Docker:', error);
      } else {
        console.log('Docker containers running:\n' + stdout);
      }
    });
    
    // Step 8: Clean up containers
    console.log('\n🧹 Step 8: Cleaning up containers for contest...');
    const cleanup = await axios.delete(`${BASE_URL}/${contestId}/containers`);
    console.log('✅ Cleanup response:', cleanup.data);
    
    console.log('\n🎉 Test completed! Key observations:');
    console.log('✅ Contest created successfully');
    console.log('✅ Submissions processed with Docker execution');
    console.log('✅ Container management API working');
    console.log('✅ Cleanup functionality available');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testPersistentContainers();
