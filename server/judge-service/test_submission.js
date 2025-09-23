require('dotenv').config();
const Judge0Service = require('./services/judge0Service');

async function testSubmission() {
  console.log('Environment check:');
  console.log('RAPIDAPI_KEY length:', process.env.RAPIDAPI_KEY ? process.env.RAPIDAPI_KEY.length : 'undefined');
  console.log('RAPIDAPI_KEY first 10 chars:', process.env.RAPIDAPI_KEY ? process.env.RAPIDAPI_KEY.substring(0, 10) + '...' : 'undefined');
  
  const judge0Service = new Judge0Service();
  
  console.log('Testing simple Java Hello World...');
  
  const testCases = [{
    input: '',
    expectedOutput: 'Hello World'
  }];
  
  const javaCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`;

  const jsCode = `console.log("Hello World");`;

  try {
    console.log('\n=== Testing Java ===');
    const javaResult = await judge0Service.evaluateSubmission({
      sourceCode: javaCode,
      language: 'java',
      testCases: testCases
    });
    
    console.log('Java Result:', JSON.stringify(javaResult, null, 2));
    
    console.log('\n=== Testing JavaScript ===');
    const jsResult = await judge0Service.evaluateSubmission({
      sourceCode: jsCode,
      language: 'javascript',
      testCases: testCases
    });
    
    console.log('JavaScript Result:', JSON.stringify(jsResult, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSubmission();
