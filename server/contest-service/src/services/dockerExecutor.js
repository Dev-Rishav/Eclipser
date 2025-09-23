const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class DockerExecutor {
  constructor() {
    this.tempDir = '/tmp/code-execution';
    this.dockerImages = {
      python: 'python:3.9-alpine',
      javascript: 'node:16-alpine',
      java: 'openjdk:11-alpine',
      cpp: 'gcc:9',
      c: 'gcc:9'
    };
    this.activeContainers = new Map(); // Track active containers by contestId
    this.containersByName = new Map(); // Track containers by name for cleanup
    this.ensureTempDir();
  }

  // Container lifecycle management
  async createPersistentContainer(contestId, language, containerName) {
    const image = this.dockerImages[language];
    const volumeMount = `-v ${this.tempDir}:/workspace`;
    const workdir = `-w /workspace`;
    
    const constraints = [
      `--memory=256m`,
      `--cpus=0.5`,
      `--network=none`,
      `--security-opt=no-new-privileges`,
      `--cap-drop=ALL`,
      `--read-only`,
      `--tmpfs /tmp:rw,size=10m`,
      `--name ${containerName}`
    ].join(' ');

    const createCommand = `docker run -d ${constraints} ${volumeMount} ${workdir} ${image} sleep infinity`;
    
    console.log(`🐳 Creating persistent container: ${containerName}`);
    const result = await this.executeWithTimeout(createCommand, '', 30000);
    
    if (result.exitCode === 0) {
      // Track the container
      if (!this.activeContainers.has(contestId)) {
        this.activeContainers.set(contestId, new Set());
      }
      this.activeContainers.get(contestId).add(containerName);
      this.containersByName.set(containerName, { contestId, language, createdAt: new Date() });
      
      console.log(`✅ Container ${containerName} created for contest ${contestId}`);
      return { success: true, containerName };
    } else {
      console.error(`❌ Failed to create container ${containerName}:`, result.stderr);
      return { success: false, error: result.stderr };
    }
  }

  async execInContainer(containerName, command, input = '', timeLimit = 5000) {
    const execCommand = `docker exec -i ${containerName} ${command}`;
    console.log(`🔧 Executing in container ${containerName}: ${command}`);
    
    return await this.executeWithTimeout(execCommand, input, timeLimit);
  }

  async stopContainer(containerName) {
    console.log(`🛑 Stopping container: ${containerName}`);
    const stopResult = await this.executeWithTimeout(`docker stop ${containerName}`, '', 10000);
    
    if (stopResult.exitCode !== 0) {
      console.warn(`⚠️ Failed to gracefully stop ${containerName}, force killing...`);
      await this.executeWithTimeout(`docker kill ${containerName}`, '', 5000);
    }
    
    return stopResult;
  }

  async removeContainer(containerName) {
    console.log(`🗑️ Removing container: ${containerName}`);
    const removeResult = await this.executeWithTimeout(`docker rm -f ${containerName}`, '', 10000);
    
    // Clean up tracking
    if (this.containersByName.has(containerName)) {
      const containerInfo = this.containersByName.get(containerName);
      if (this.activeContainers.has(containerInfo.contestId)) {
        this.activeContainers.get(containerInfo.contestId).delete(containerName);
      }
      this.containersByName.delete(containerName);
    }
    
    return removeResult;
  }

  async cleanupContestContainers(contestId) {
    console.log(`🧹 Cleaning up all containers for contest: ${contestId}`);
    
    if (this.activeContainers.has(contestId)) {
      const containers = Array.from(this.activeContainers.get(contestId));
      const cleanupPromises = containers.map(containerName => 
        this.removeContainer(containerName)
      );
      
      await Promise.all(cleanupPromises);
      this.activeContainers.delete(contestId);
      console.log(`✅ Cleaned up ${containers.length} containers for contest ${contestId}`);
    }
  }

  async getContainerStatus(containerName) {
    const statusCommand = `docker inspect ${containerName} --format='{{.State.Status}}'`;
    const result = await this.executeWithTimeout(statusCommand, '', 5000);
    
    if (result.exitCode === 0) {
      return result.stdout.trim();
    }
    return 'not_found';
  }

  getActiveContainers() {
    return {
      byContest: Object.fromEntries(this.activeContainers),
      byName: Object.fromEntries(this.containersByName),
      totalCount: this.containersByName.size
    };
  }

  async ensureTempDir() {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  generateContainerName() {
    return `code-exec-${crypto.randomBytes(8).toString('hex')}`;
  }

  getFileExtension(language) {
    const extensions = {
      python: 'py',
      javascript: 'js',
      java: 'java',
      cpp: 'cpp',
      c: 'c'
    };
    return extensions[language] || 'txt';
  }

  async writeCodeToFile(code, language, sessionId) {
    const ext = this.getFileExtension(language);
    const filename = `solution_${sessionId}.${ext}`;
    const filepath = path.join(this.tempDir, filename);
    
    await fs.writeFile(filepath, code, 'utf8');
    return { filename, filepath };
  }

  async writeTestCaseFiles(testCases, sessionId) {
    const testCaseFiles = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const inputFile = `input_${sessionId}_${i}.txt`;
      const outputFile = `output_${sessionId}_${i}.txt`;
      const inputPath = path.join(this.tempDir, inputFile);
      const outputPath = path.join(this.tempDir, outputFile);
      
      await fs.writeFile(inputPath, testCases[i].input, 'utf8');
      await fs.writeFile(outputPath, testCases[i].expectedOutput, 'utf8');
      
      testCaseFiles.push({
        testCase: testCases[i],
        inputFile,
        outputFile,
        inputPath,
        outputPath
      });
    }
    
    return testCaseFiles;
  }

  buildDockerCommand(language, filename, containerName, timeLimit, memoryLimit, persistentMode = true) {
    const image = this.dockerImages[language];
    const volumeMount = `-v ${this.tempDir}:/workspace`;
    const workdir = `-w /workspace`;
    
    // Base constraints for container security
    const constraints = [
      `--memory=${memoryLimit}m`,
      `--cpus=0.5`,
      `--network=none`,
      `--security-opt=no-new-privileges`,
      `--cap-drop=ALL`,
      `--read-only`,
      `--tmpfs /tmp:rw,size=10m`,
      `--name ${containerName}`
    ];

    // Add --rm only if not in persistent mode
    if (!persistentMode) {
      constraints.unshift('--rm');
    }

    const constraintString = constraints.join(' ');

    const commands = {
      python: `timeout ${Math.ceil(timeLimit/1000)}s python ${filename}`,
      javascript: `timeout ${Math.ceil(timeLimit/1000)}s node ${filename}`,
      java: `timeout ${Math.ceil(timeLimit/1000)}s sh -c "javac ${filename} && java ${path.parse(filename).name}"`,
      cpp: `timeout ${Math.ceil(timeLimit/1000)}s sh -c "g++ -o solution ${filename} && ./solution"`,
      c: `timeout ${Math.ceil(timeLimit/1000)}s sh -c "gcc -o solution ${filename} && ./solution"`
    };

    if (persistentMode) {
      // For persistent containers, we create them in detached mode and exec commands
      return {
        createCommand: `docker run -d ${constraintString} ${volumeMount} ${workdir} ${image} sleep infinity`,
        execCommand: `docker exec ${containerName} ${commands[language]}`
      };
    } else {
      // Legacy mode - run and remove immediately
      return `docker run --rm ${constraintString} ${volumeMount} ${workdir} ${image} ${commands[language]}`;
    }
  }

  async runCode(code, language, input = '', timeLimit = 1000, memoryLimit = 128, contestId = null, persistent = true) {
    const sessionId = crypto.randomBytes(8).toString('hex');
    const containerName = contestId ? 
      `contest-${contestId}-${language}-${sessionId}` : 
      this.generateContainerName();
    
    try {
      // Write code to file
      const { filename } = await this.writeCodeToFile(code, language, sessionId);
      
      let result;
      const startTime = Date.now();
      
      if (persistent && contestId) {
        // Use persistent container approach
        console.log(`🐳 Using persistent container mode for contest ${contestId}`);
        
        // Create container if not exists
        const containerStatus = await this.getContainerStatus(containerName);
        if (containerStatus === 'not_found') {
          const createResult = await this.createPersistentContainer(contestId, language, containerName);
          if (!createResult.success) {
            throw new Error(`Failed to create container: ${createResult.error}`);
          }
        } else if (containerStatus !== 'running') {
          // Start existing container
          await this.executeWithTimeout(`docker start ${containerName}`, '', 10000);
        }
        
        // Execute code in persistent container
        const commands = {
          python: `timeout ${Math.ceil(timeLimit/1000)}s python ${filename}`,
          javascript: `timeout ${Math.ceil(timeLimit/1000)}s node ${filename}`,
          java: `timeout ${Math.ceil(timeLimit/1000)}s sh -c "javac ${filename} && java ${path.parse(filename).name}"`,
          cpp: `timeout ${Math.ceil(timeLimit/1000)}s sh -c "g++ -o solution ${filename} && ./solution"`,
          c: `timeout ${Math.ceil(timeLimit/1000)}s sh -c "gcc -o solution ${filename} && ./solution"`
        };
        
        result = await this.execInContainer(containerName, commands[language], input, timeLimit + 2000);
        
      } else {
        // Use legacy one-time container approach
        console.log(`🐳 Using legacy container mode (--rm)`);
        const dockerCommand = this.buildDockerCommand(language, filename, containerName, timeLimit, memoryLimit, false);
        result = await this.executeWithTimeout(dockerCommand, input, timeLimit + 5000);
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        success: result.exitCode === 0,
        output: result.stdout,
        error: result.stderr,
        executionTime,
        memoryUsed: persistent ? await this.getContainerMemoryUsage(containerName) : 0,
        exitCode: result.exitCode,
        timedOut: result.timedOut,
        containerName: persistent ? containerName : null
      };
    } catch (error) {
      console.error(`❌ Error in runCode:`, error);
      return {
        success: false,
        output: '',
        error: error.message,
        executionTime: 0,
        memoryUsed: 0,
        exitCode: -1,
        timedOut: false,
        containerName: null
      };
    } finally {
      // Cleanup temporary files (not containers in persistent mode)
      await this.cleanupFiles(sessionId);
    }
  }

  async runTestCases(code, language, testCases, timeLimit = 1000, memoryLimit = 128, contestId = null) {
    const sessionId = crypto.randomBytes(8).toString('hex');
    const results = [];
    let totalScore = 0;
    let passedTests = 0;
    let containerName = null;
    
    const persistent = !!contestId;
    
    try {
      // Write code to file
      const { filename } = await this.writeCodeToFile(code, language, sessionId);
      
      if (persistent) {
        // Use single persistent container for all test cases
        containerName = `contest-${contestId}-${language}-${sessionId}`;
        
        const containerStatus = await this.getContainerStatus(containerName);
        if (containerStatus === 'not_found') {
          const createResult = await this.createPersistentContainer(contestId, language, containerName);
          if (!createResult.success) {
            throw new Error(`Failed to create container: ${createResult.error}`);
          }
        } else if (containerStatus !== 'running') {
          await this.executeWithTimeout(`docker start ${containerName}`, '', 10000);
        }
      }
      
      // Process each test case
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        try {
          let result;
          const startTime = Date.now();
          
          if (persistent) {
            // Execute in persistent container
            const commands = {
              python: `timeout ${Math.ceil((testCase.timeLimit || timeLimit)/1000)}s python ${filename}`,
              javascript: `timeout ${Math.ceil((testCase.timeLimit || timeLimit)/1000)}s node ${filename}`,
              java: `timeout ${Math.ceil((testCase.timeLimit || timeLimit)/1000)}s sh -c "javac ${filename} && java ${path.parse(filename).name}"`,
              cpp: `timeout ${Math.ceil((testCase.timeLimit || timeLimit)/1000)}s sh -c "g++ -o solution ${filename} && ./solution"`,
              c: `timeout ${Math.ceil((testCase.timeLimit || timeLimit)/1000)}s sh -c "gcc -o solution ${filename} && ./solution"`
            };
            
            result = await this.execInContainer(containerName, commands[language], testCase.input, (testCase.timeLimit || timeLimit) + 2000);
          } else {
            // Use legacy one-time containers
            const tempContainerName = `${this.generateContainerName()}_tc${i}`;
            const dockerCommand = this.buildDockerCommand(language, filename, tempContainerName, testCase.timeLimit || timeLimit, testCase.memoryLimit || memoryLimit, false);
            result = await this.executeWithTimeout(dockerCommand, testCase.input, (testCase.timeLimit || timeLimit) + 2000);
          }
          
          const executionTime = Date.now() - startTime;
          
          const actualOutput = result.stdout.trim();
          const expectedOutput = testCase.expectedOutput.trim();
          const passed = actualOutput === expectedOutput && result.exitCode === 0;
          
          if (passed) {
            passedTests++;
            totalScore += testCase.weight || 1;
          }
          
          const testResult = {
            testCaseId: testCase._id,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: actualOutput,
            status: this.determineTestStatus(result, actualOutput, expectedOutput),
            executionTime: executionTime,
            memoryUsed: await this.getMemoryUsage(containerName),
            errorMessage: result.stderr
          };
          
          results.push(testResult);
        } catch (error) {
          results.push({
            testCaseId: testCase._id,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            status: 'error',
            executionTime: 0,
            memoryUsed: 0,
            errorMessage: error.message
          });
        }
        
        // Cleanup container after each test
        await this.cleanupContainer(containerName);
      }
      
      return {
        totalTestCases: testCases.length,
        passedTestCases: passedTests,
        score: totalScore,
        maxScore: testCases.reduce((sum, tc) => sum + (tc.weight || 1), 0),
        testCaseResults: results,
        overallStatus: this.determineOverallStatus(results)
      };
    } finally {
      // Cleanup files
      await this.cleanupFiles(sessionId);
    }
  }

  determineTestStatus(result, actualOutput, expectedOutput) {
    if (result.timedOut) return 'timeout';
    if (result.exitCode !== 0) return 'error';
    if (actualOutput === expectedOutput) return 'passed';
    return 'failed';
  }

  determineOverallStatus(results) {
    if (results.some(r => r.status === 'error')) return 'runtime_error';
    if (results.some(r => r.status === 'timeout')) return 'time_limit_exceeded';
    if (results.every(r => r.status === 'passed')) return 'accepted';
    return 'wrong_answer';
  }

  async executeWithTimeout(command, input, timeoutMs) {
    return new Promise((resolve) => {
      let timedOut = false;
      
      const childProcess = exec(command, {
        timeout: timeoutMs,
        maxBuffer: 1024 * 1024 // 1MB buffer
      }, (error, stdout, stderr) => {
        if (timedOut) return;
        
        resolve({
          exitCode: error ? error.code || -1 : 0,
          stdout: stdout || '',
          stderr: stderr || '',
          timedOut: false
        });
      });
      
      // Send input to process
      if (input) {
        childProcess.stdin.write(input);
        childProcess.stdin.end();
      }
      
      // Handle timeout
      const timeout = setTimeout(() => {
        timedOut = true;
        childProcess.kill('SIGKILL');
        resolve({
          exitCode: -1,
          stdout: '',
          stderr: 'Time limit exceeded',
          timedOut: true
        });
      }, timeoutMs);
      
      childProcess.on('exit', () => {
        clearTimeout(timeout);
      });
    });
  }

  async getMemoryUsage(containerName) {
    try {
      const statsCommand = `docker stats ${containerName} --no-stream --format "table {{.MemUsage}}" | tail -1`;
      const result = await this.executeWithTimeout(statsCommand, '', 5000);
      const memUsage = result.stdout.trim();
      
      // Parse memory usage (e.g., "45.2MiB / 128MiB")
      const match = memUsage.match(/([0-9.]+)MiB/);
      return match ? parseFloat(match[1]) : 0;
    } catch {
      return 0;
    }
  }

  async cleanup(sessionId, containerName) {
    await Promise.all([
      this.cleanupFiles(sessionId),
      this.cleanupContainer(containerName)
    ]);
  }

  async cleanupFiles(sessionId) {
    try {
      const files = await fs.readdir(this.tempDir);
      const sessionFiles = files.filter(file => file.includes(sessionId));
      
      await Promise.all(
        sessionFiles.map(file => 
          fs.unlink(path.join(this.tempDir, file)).catch(() => {})
        )
      );
    } catch (error) {
      console.warn('Failed to cleanup files:', error.message);
    }
  }

  async cleanupContainer(containerName) {
    try {
      // Force remove container
      await this.executeWithTimeout(`docker rm -f ${containerName}`, '', 5000);
    } catch (error) {
      console.warn('Failed to cleanup container:', error.message);
    }
  }

  async checkDockerAvailability() {
    try {
      const result = await this.executeWithTimeout('docker --version', '', 5000);
      return result.exitCode === 0;
    } catch {
      return false;
    }
  }
}

module.exports = DockerExecutor;
