#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Simple Container Runner
 * A standalone script to spin up Docker containers for code execution
 * No auto container creation - manual container management
 */
class SimpleContainerRunner {
  constructor() {
    this.tempDir = '/tmp/simple-code-execution';
    this.dockerImages = {
      python: 'python:3.9-slim',
      javascript: 'node:18-slim',
      java: 'openjdk:11',
      cpp: 'gcc:latest',
      c: 'gcc:latest'
    };
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
      console.log(`📁 Created temp directory: ${this.tempDir}`);
    }
  }

  /**
   * Create and start a container manually
   * @param {string} containerName - Name for the container
   * @param {string} language - Programming language (python, javascript, java, cpp, c)
   * @param {Object} options - Container options
   * @returns {Promise<Object>} Result object
   */
  async createContainer(containerName, language = 'python', options = {}) {
    const {
      memoryLimit = '256m',
      cpuLimit = '0.5',
      timeLimit = 30, // seconds
      workDir = '/workspace'
    } = options;

    const image = this.dockerImages[language];
    if (!image) {
      throw new Error(`Unsupported language: ${language}`);
    }

    console.log(`🐳 Creating container: ${containerName} with ${language} (${image})`);

    const createCommand = [
      'docker run -d',
      `--name ${containerName}`,
      `--memory=${memoryLimit}`,
      `--cpus=${cpuLimit}`,
      '--network=none', // No network access
      '--security-opt=no-new-privileges',
      '--cap-drop=ALL',
      '--read-only',
      '--tmpfs /tmp:rw,size=50m',
      `--tmpfs ${workDir}:rw,size=100m`,
      `-w ${workDir}`,
      `--user 1000:1000`, // Non-root user
      image,
      'sleep infinity' // Keep container running
    ].join(' ');

    try {
      const result = await this.executeCommand(createCommand);
      if (result.code === 0) {
        console.log(`✅ Container created successfully: ${containerName}`);
        console.log(`📦 Container ID: ${result.stdout.trim()}`);
        return { success: true, containerId: result.stdout.trim() };
      } else {
        throw new Error(result.stderr);
      }
    } catch (error) {
      console.error(`❌ Failed to create container:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute code in an existing container
   * @param {string} containerName - Name of the container
   * @param {string} code - Code to execute
   * @param {string} language - Programming language
   * @param {string} input - Input for the code (stdin)
   * @returns {Promise<Object>} Execution result
   */
  async executeCode(containerName, code, language, input = '') {
    console.log(`🔧 Executing ${language} code in container: ${containerName}`);

    try {
      // Check if container exists and is running
      const statusResult = await this.executeCommand(`docker inspect ${containerName} --format='{{.State.Status}}'`);
      if (statusResult.code !== 0) {
        throw new Error(`Container ${containerName} not found`);
      }
      
      const status = statusResult.stdout.trim();
      if (status !== 'running') {
        throw new Error(`Container ${containerName} is not running (status: ${status})`);
      }

      // Write code to container
      const filename = this.getFilename(language);
      const writeCommand = `docker exec -i ${containerName} sh -c "cat > ${filename}"`;
      await this.executeCommand(writeCommand, code);
      console.log(`📝 Code written to ${filename} in container`);

      // Execute the code
      const execCommand = this.getExecutionCommand(language, filename);
      const dockerExecCommand = `docker exec -i ${containerName} ${execCommand}`;
      
      const startTime = Date.now();
      const result = await this.executeCommand(dockerExecCommand, input, 10000); // 10 second timeout
      const executionTime = Date.now() - startTime;

      console.log(`⏱️ Execution completed in ${executionTime}ms`);
      
      return {
        success: result.code === 0,
        output: result.stdout,
        error: result.stderr,
        executionTime,
        exitCode: result.code
      };

    } catch (error) {
      console.error(`❌ Execution failed:`, error.message);
      return {
        success: false,
        output: '',
        error: error.message,
        executionTime: 0,
        exitCode: -1
      };
    }
  }

  /**
   * List all containers (including stopped ones)
   */
  async listContainers() {
    console.log(`📋 Listing all containers:`);
    try {
      const result = await this.executeCommand('docker ps -a --format "table {{.Names}}\\t{{.Status}}\\t{{.Image}}\\t{{.CreatedAt}}"');
      console.log(result.stdout);
      return result.stdout;
    } catch (error) {
      console.error(`❌ Failed to list containers:`, error.message);
    }
  }

  /**
   * Stop a container
   * @param {string} containerName - Name of the container to stop
   */
  async stopContainer(containerName) {
    console.log(`🛑 Stopping container: ${containerName}`);
    try {
      const result = await this.executeCommand(`docker stop ${containerName}`);
      if (result.code === 0) {
        console.log(`✅ Container stopped: ${containerName}`);
      } else {
        console.log(`⚠️ Stop command returned code ${result.code}: ${result.stderr}`);
      }
      return result.code === 0;
    } catch (error) {
      console.error(`❌ Failed to stop container:`, error.message);
      return false;
    }
  }

  /**
   * Remove a container
   * @param {string} containerName - Name of the container to remove
   */
  async removeContainer(containerName) {
    console.log(`🗑️ Removing container: ${containerName}`);
    try {
      const result = await this.executeCommand(`docker rm -f ${containerName}`);
      if (result.code === 0) {
        console.log(`✅ Container removed: ${containerName}`);
      } else {
        console.log(`⚠️ Remove command returned code ${result.code}: ${result.stderr}`);
      }
      return result.code === 0;
    } catch (error) {
      console.error(`❌ Failed to remove container:`, error.message);
      return false;
    }
  }

  /**
   * Get filename based on language
   */
  getFilename(language) {
    const extensions = {
      python: 'solution.py',
      javascript: 'solution.js',
      java: 'Solution.java',
      cpp: 'solution.cpp',
      c: 'solution.c'
    };
    return extensions[language] || 'solution.txt';
  }

  /**
   * Get execution command based on language
   */
  getExecutionCommand(language, filename) {
    const commands = {
      python: `python ${filename}`,
      javascript: `node ${filename}`,
      java: `javac ${filename} && java Solution`,
      cpp: `g++ -o solution ${filename} && ./solution`,
      c: `gcc -o solution ${filename} && ./solution`
    };
    return commands[language] || `cat ${filename}`;
  }

  /**
   * Execute a shell command with optional input and timeout
   */
  executeCommand(command, input = '', timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const process = exec(command, { timeout: timeoutMs }, (error, stdout, stderr) => {
        if (error && error.code !== 'ETIMEDOUT') {
          resolve({ code: error.code || 1, stdout, stderr });
        } else if (error && error.code === 'ETIMEDOUT') {
          resolve({ code: 124, stdout, stderr: 'Command timed out' });
        } else {
          resolve({ code: 0, stdout, stderr });
        }
      });

      // Send input if provided
      if (input) {
        process.stdin.write(input);
        process.stdin.end();
      }
    });
  }

  /**
   * Check if Docker is available
   */
  async checkDocker() {
    try {
      const result = await this.executeCommand('docker --version');
      if (result.code === 0) {
        console.log(`✅ Docker is available: ${result.stdout.trim()}`);
        return true;
      } else {
        console.error(`❌ Docker check failed: ${result.stderr}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Docker is not available: ${error.message}`);
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const runner = new SimpleContainerRunner();
  const args = process.argv.slice(2);
  const command = args[0];

  if (!await runner.checkDocker()) {
    console.error('❌ Docker is required but not available');
    process.exit(1);
  }

  switch (command) {
    case 'create':
      const containerName = args[1] || `simple-container-${crypto.randomBytes(4).toString('hex')}`;
      const language = args[2] || 'python';
      const result = await runner.createContainer(containerName, language);
      if (result.success) {
        console.log(`🎉 Container ready! Use: node ${process.argv[1]} exec ${containerName} <language> "<code>"`);
      }
      break;

    case 'exec':
      const execContainerName = args[1];
      const execLanguage = args[2] || 'python';
      const code = args[3];
      const input = args[4] || '';
      
      if (!execContainerName || !code) {
        console.log('Usage: node simple-container-runner.js exec <container-name> <language> "<code>" "[input]"');
        break;
      }
      
      const execResult = await runner.executeCode(execContainerName, code, execLanguage, input);
      console.log('\n🎯 Execution Results:');
      console.log('================');
      console.log('Success:', execResult.success);
      console.log('Output:', execResult.output);
      if (execResult.error) console.log('Error:', execResult.error);
      console.log('Time:', execResult.executionTime + 'ms');
      break;

    case 'list':
      await runner.listContainers();
      break;

    case 'stop':
      const stopName = args[1];
      if (!stopName) {
        console.log('Usage: node simple-container-runner.js stop <container-name>');
        break;
      }
      await runner.stopContainer(stopName);
      break;

    case 'remove':
      const removeName = args[1];
      if (!removeName) {
        console.log('Usage: node simple-container-runner.js remove <container-name>');
        break;
      }
      await runner.removeContainer(removeName);
      break;

    default:
      console.log('🐳 Simple Container Runner');
      console.log('=======================');
      console.log('Usage:');
      console.log('  create [container-name] [language]  - Create a new container');
      console.log('  exec <container-name> <language> "<code>" "[input]" - Execute code');
      console.log('  list                                 - List all containers');
      console.log('  stop <container-name>               - Stop a container');
      console.log('  remove <container-name>             - Remove a container');
      console.log('');
      console.log('Supported languages: python, javascript, java, cpp, c');
      console.log('');
      console.log('Examples:');
      console.log('  node simple-container-runner.js create my-python-container python');
      console.log('  node simple-container-runner.js exec my-python-container python "print(\'Hello World\')"');
      console.log('  node simple-container-runner.js exec my-python-container python "print(input())" "Hello"');
      break;
  }
}

// Export for programmatic use
module.exports = SimpleContainerRunner;

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error);
}
