const express = require('express');
const router = express.Router();
const socketService = require('../utils/socketService');

// Test endpoint to emit submission update
router.post('/test/submission-update', (req, res) => {
  try {
    const { submissionId, contestId, userId, status, result } = req.body;
    
    const submissionData = {
      submissionId: submissionId || 'test_submission_123',
      contestId: contestId || 'test_contest_456',
      userId: userId || 'test_user_789',
      status: status || 'completed',
      result: result || {
        status: 'accepted',
        executionTime: 150,
        memoryUsed: 45.2,
        testCasesPassed: 10,
        totalTestCases: 10
      },
      timestamp: new Date(),
      message: 'Test submission update'
    };
    
    socketService.emitSubmissionUpdate(submissionData);
    res.json({ message: 'Submission update emitted', data: submissionData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to emit contest update
router.post('/test/contest-update', (req, res) => {
  try {
    const { contestId, type, userId } = req.body;
    
    const contestData = {
      contestId: contestId || 'test_contest_456',
      type: type || 'new_submission',
      userId: userId || 'test_user_789',
      submission: {
        id: 'test_submission_123',
        userId: userId || 'test_user_789',
        result: { status: 'accepted' },
        submittedAt: new Date()
      },
      timestamp: new Date(),
      message: 'Test contest update'
    };
    
    socketService.emitContestUpdate(contestData);
    res.json({ message: 'Contest update emitted', data: contestData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to emit winner announcement
router.post('/test/winner-announcement', (req, res) => {
  try {
    const { contestId, winner } = req.body;
    
    socketService.emitWinnerAnnouncement(
      contestId || 'test_contest_456',
      winner || 'test_user_789'
    );
    
    res.json({ 
      message: 'Winner announcement emitted',
      contestId: contestId || 'test_contest_456',
      winner: winner || 'test_user_789'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to emit to specific contest
router.post('/test/emit-to-contest', (req, res) => {
  try {
    const { contestId, event, data } = req.body;
    
    socketService.emitToContest(
      contestId || 'test_contest_456',
      event || 'custom_event',
      data || { message: 'Test data for contest' }
    );
    
    res.json({ 
      message: 'Event emitted to contest',
      contestId: contestId || 'test_contest_456',
      event: event || 'custom_event',
      data: data || { message: 'Test data for contest' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to emit to specific user
router.post('/test/emit-to-user', (req, res) => {
  try {
    const { userId, event, data } = req.body;
    
    socketService.emitToUser(
      userId || 'test_user_789',
      event || 'custom_event',
      data || { message: 'Test data for user' }
    );
    
    res.json({ 
      message: 'Event emitted to user',
      userId: userId || 'test_user_789',
      event: event || 'custom_event',
      data: data || { message: 'Test data for user' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to emit to all clients
router.post('/test/emit-to-all', (req, res) => {
  try {
    const { event, data } = req.body;
    
    socketService.emitToAll(
      event || 'broadcast_event',
      data || { message: 'Test broadcast message' }
    );
    
    res.json({ 
      message: 'Event emitted to all clients',
      event: event || 'broadcast_event',
      data: data || { message: 'Test broadcast message' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Socket.IO connection info
router.get('/test/socket-info', (req, res) => {
  try {
    const io = socketService.getIO();
    const sockets = io.sockets.sockets;
    const connectedClients = Array.from(sockets.keys());
    
    res.json({
      totalConnections: connectedClients.length,
      connectedClients,
      rooms: Array.from(io.sockets.adapter.rooms.keys()),
      message: 'Socket.IO service is active'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
