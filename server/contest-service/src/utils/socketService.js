// Socket.IO utility functions
class SocketService {
  constructor() {
    this.io = null;
  }

  // Initialize with the io instance
  init(io) {
    this.io = io;
  }

  // Get the io instance
  getIO() {
    if (!this.io) {
      console.warn('⚠️  Socket.IO not initialized yet');
      return null;
    }
    return this.io;
  }

  // Check if socket is ready
  isReady() {
    return this.io !== null;
  }

  // Emit to a specific contest room
  emitToContest(contestId, event, data) {
    if (this.io) {
      this.io.to(`contest_${contestId}`).emit(event, data);
      console.log(`📤 Emitted '${event}' to contest_${contestId}`);
    } else {
      console.warn('⚠️  Socket.IO not ready, cannot emit to contest room');
    }
  }

  // Emit to a specific user
  emitToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(event, data);
      console.log(`📤 Emitted '${event}' to user_${userId}`);
    } else {
      console.warn('⚠️  Socket.IO not ready, cannot emit to user room');
    }
  }

  // Emit to all connected clients
  emitToAll(event, data) {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`📤 Emitted '${event}' to all clients`);
    } else {
      console.warn('⚠️  Socket.IO not ready, cannot emit to all clients');
    }
  }

  // Emit submission update
  emitSubmissionUpdate(submissionData) {
    if (!this.isReady()) {
      console.warn('⚠️  Socket.IO not ready, queuing submission update');
      return;
    }

    const { contestId, userId } = submissionData;
    
    // Emit to the contest room
    this.emitToContest(contestId, 'submission_update', submissionData);
    
    // Emit to the specific user
    this.emitToUser(userId, 'submission_update', submissionData);
  }

  // Emit contest update
  emitContestUpdate(contestData) {
    if (!this.isReady()) {
      console.warn('⚠️  Socket.IO not ready, queuing contest update');
      return;
    }

    const { contestId } = contestData;
    
    // Emit to the contest room
    this.emitToContest(contestId, 'contest_update', contestData);
    
    // Also emit to all clients for general contest updates
    this.emitToAll('contest_update', contestData);
  }

  // Emit winner announcement
  emitWinnerAnnouncement(contestId, winner) {
    const winnerData = {
      contestId,
      type: 'winner_declared',
      winner,
      timestamp: new Date(),
      message: `🏆 Contest winner: ${winner}`
    };
    
    this.emitContestUpdate(winnerData);
  }
}

// Create singleton instance
const socketService = new SocketService();

module.exports = socketService;
