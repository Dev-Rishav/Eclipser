// Test base64 encoding/decoding
const javaCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`;

const jsCode = `console.log("Hello World");`;

console.log('=== Java Code ===');
console.log('Original:', JSON.stringify(javaCode));
console.log('Base64:', Buffer.from(javaCode, 'utf8').toString('base64'));
console.log('Decoded:', Buffer.from(Buffer.from(javaCode, 'utf8').toString('base64'), 'base64').toString('utf8'));

console.log('\n=== JavaScript Code ===');
console.log('Original:', JSON.stringify(jsCode));
console.log('Base64:', Buffer.from(jsCode, 'utf8').toString('base64'));
console.log('Decoded:', Buffer.from(Buffer.from(jsCode, 'utf8').toString('base64'), 'base64').toString('utf8'));

// Test the specific base64 from the error
console.log('\n=== From Error ===');
console.log('Y29uc29sZS5sb2co decodes to:', Buffer.from('Y29uc29sZS5sb2co', 'base64').toString('utf8'));
