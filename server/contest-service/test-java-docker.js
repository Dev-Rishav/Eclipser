#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

const testCode = `
public class code {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`;

const testFile = '/tmp/test-java.java';
fs.writeFileSync(testFile, testCode);

const command = `docker run --rm -v ${testFile}:/code.java openjdk:11 sh -c "cd / && javac code.java && java code"`;

console.log('🧪 Testing Java execution with Docker...');
console.log('📋 Command:', command);

exec(command, { timeout: 30000 }, (err, stdout, stderr) => {
  console.log('📤 STDOUT:', stdout || '[none]');
  console.log('❌ STDERR:', stderr || '[none]');
  console.log('⚠️  Error:', err || '[no error]');
  
  if (!err && stdout && stdout.includes('Hello, World!')) {
    console.log('✅ Java execution test PASSED!');
  } else {
    console.log('❌ Java execution test FAILED!');
  }
  
  // Cleanup
  try {
    fs.unlinkSync(testFile);
  } catch (cleanupErr) {
    console.warn('⚠️  Failed to cleanup test file:', cleanupErr.message);
  }
});
