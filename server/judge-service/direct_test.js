require('dotenv').config();
const axios = require('axios');

async function directJudge0Test() {
  const BASE_URL = 'https://judge0-ce.p.rapidapi.com';
  const headers = {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
  };

  const javaCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`;

  const payload = {
    source_code: javaCode,  // Send plain text instead of base64
    language_id: 62,
    stdin: '',
    expected_output: 'Hello World'  // Send plain text instead of base64
  };

  try {
    console.log('Sending payload:', JSON.stringify(payload, null, 2));
    
    // Create submission
    const createResponse = await axios.post(`${BASE_URL}/submissions`, payload, { headers });
    console.log('Create response:', createResponse.data);
    
    const token = createResponse.data.token;
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get result
    const resultResponse = await axios.get(`${BASE_URL}/submissions/${token}`, { headers });
    console.log('Result response:', JSON.stringify(resultResponse.data, null, 2));
    
    // Decode outputs
    const result = resultResponse.data;
    if (result.stdout) console.log('Stdout decoded:', Buffer.from(result.stdout, 'base64').toString('utf8'));
    if (result.stderr) console.log('Stderr decoded:', Buffer.from(result.stderr, 'base64').toString('utf8'));
    if (result.compile_output) console.log('Compile output decoded:', Buffer.from(result.compile_output, 'base64').toString('utf8'));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

directJudge0Test();
