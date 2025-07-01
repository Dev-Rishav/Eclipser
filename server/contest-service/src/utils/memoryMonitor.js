const os = require('os');

class MemoryMonitor {
  constructor(options = {}) {
    this.interval = options.interval || 60000; // 1 minute default
    this.warningThreshold = options.warningThreshold || 0.8; // 80%
    this.criticalThreshold = options.criticalThreshold || 0.9; // 90%
    this.isMonitoring = false;
    this.stats = {
      peak: 0,
      average: 0,
      samples: []
    };
  }

  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 Memory monitoring started');
    
    this.monitorInterval = setInterval(() => {
      this.checkMemory();
    }, this.interval);

    // Initial check
    this.checkMemory();
  }

  stop() {
    if (!this.isMonitoring) return;
    
    clearInterval(this.monitorInterval);
    this.isMonitoring = false;
    console.log('🔍 Memory monitoring stopped');
  }

  checkMemory() {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    const processMemMB = Math.round(memUsage.rss / 1024 / 1024);
    const systemMemMB = Math.round(usedMem / 1024 / 1024);
    const totalMemMB = Math.round(totalMem / 1024 / 1024);
    
    const systemMemPercent = usedMem / totalMem;
    const processMemPercent = memUsage.rss / totalMem;
    
    // Update stats
    this.stats.samples.push(processMemMB);
    if (this.stats.samples.length > 100) {
      this.stats.samples.shift(); // Keep only last 100 samples
    }
    
    this.stats.peak = Math.max(this.stats.peak, processMemMB);
    this.stats.average = this.stats.samples.reduce((a, b) => a + b, 0) / this.stats.samples.length;
    
    const status = {
      process: {
        rss: processMemMB + 'MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
      },
      system: {
        used: systemMemMB + 'MB',
        free: Math.round(freeMem / 1024 / 1024) + 'MB',
        total: totalMemMB + 'MB',
        percent: Math.round(systemMemPercent * 100) + '%'
      },
      stats: {
        peak: Math.round(this.stats.peak) + 'MB',
        average: Math.round(this.stats.average) + 'MB'
      }
    };

    // Log based on severity
    if (systemMemPercent > this.criticalThreshold) {
      console.error('🚨 CRITICAL: System memory usage is very high!', status);
      this.handleCriticalMemory();
    } else if (systemMemPercent > this.warningThreshold) {
      console.warn('⚠️  WARNING: High system memory usage', status);
    } else if (process.env.NODE_ENV === 'development') {
      console.log('📊 Memory Status:', status);
    }

    return status;
  }

  handleCriticalMemory() {
    // Force garbage collection if available
    if (global.gc) {
      console.log('🗑️  Forcing garbage collection...');
      global.gc();
    }

    // Could add more aggressive cleanup here
    // e.g., clear caches, reject new requests temporarily, etc.
  }

  getStats() {
    return {
      ...this.stats,
      current: this.checkMemory()
    };
  }
}

// Create singleton instance
const memoryMonitor = new MemoryMonitor({
  interval: process.env.NODE_ENV === 'production' ? 30000 : 60000, // 30s in production
  warningThreshold: 0.75, // 75% warning for AWS free tier
  criticalThreshold: 0.85  // 85% critical for AWS free tier
});

module.exports = memoryMonitor;
