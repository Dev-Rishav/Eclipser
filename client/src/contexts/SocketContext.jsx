import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../config/api';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [submissions, setSubmissions] = useState(new Map());
  const [contests, setContests] = useState(new Map());
  const userId = 'user_22222'; //! Replace with actual user ID or token

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(API_CONFIG.CONTEST_BASE_URL, {
      auth: { userId }, 
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('🔌 Connected to contest service:', newSocket.id);
      setConnected(true);
      toast.success('Connected to real-time service!');
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from contest service');
      setConnected(false);
      toast.warn('Disconnected from real-time service');
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      setConnected(false);
      toast.error('Failed to connect to real-time service');
    });

    // Listen for submission updates
    newSocket.on('submission_update', (data) => {
      console.log('📋 Submission update received:', data);
      
      setSubmissions(prev => {
        const updated = new Map(prev);
        updated.set(data.submissionId, data);
        return updated;
      });

      // Show toast notifications based on status
      switch (data.status) {
        case 'processing':
          toast.info(`🔄 Processing submission: ${data.submissionId.slice(-8)}`);
          break;
        case 'completed': {
          const result = data.result?.status;
          if (result === 'accepted') {
            toast.success(`✅ Submission accepted! ${data.result?.testCasesPassed}/${data.result?.totalTestCases} tests passed`);
          } else if (result === 'wrong_answer') {
            toast.error(`❌ Wrong answer: ${data.result?.testCasesPassed}/${data.result?.totalTestCases} tests passed`);
          } else if (result === 'time_limit_exceeded') {
            toast.error(`⏰ Time limit exceeded`);
          } else if (result === 'runtime_error') {
            toast.error(`💥 Runtime error`);
          } else {
            toast.info(`📊 Submission completed: ${result}`);
          }
          break;
        }
        case 'error':
          toast.error(`❌ Submission error: ${data.error}`);
          break;
      }
    });

    // Listen for contest updates
    newSocket.on('contest_update', (data) => {
      console.log('🏆 Contest update received:', data);
      
      setContests(prev => {
        const updated = new Map(prev);
        updated.set(data.contestId, data);
        return updated;
      });

      // Show toast notifications for contest events
      switch (data.type) {
        case 'contest_created':
          toast.info(`🆕 New contest created: ${data.contestId.slice(-8)}`);
          break;
        case 'user_joined':
          toast.info(`👤 ${data.userId} joined the contest`);
          break;
        case 'new_submission':
          toast.info(`📝 New submission in contest by ${data.submission?.userId}`);
          break;
        case 'winner_declared':
          toast.success(`🏆 Contest winner: ${data.winner}!`);
          break;
      }
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Socket utility functions
  const joinContest = (contestId) => {
    if (socket && contestId) {
      socket.emit('join_contest', contestId);
      console.log(`🎯 Joined contest room: ${contestId}`);
    }
  };

  const joinUserRoom = (userId) => {
    if (socket && userId) {
      socket.emit('join_user_room', userId);
      console.log(`👤 Joined user room: ${userId}`);
    }
  };

  const leaveContest = (contestId) => {
    if (socket && contestId) {
      socket.emit('leave_contest', contestId);
      console.log(`🚪 Left contest room: ${contestId}`);
    }
  };

  const getSubmissionStatus = (submissionId) => {
    return submissions.get(submissionId);
  };

  const value = {
    socket,
    connected,
    submissions: Array.from(submissions.values()),
    contests: Array.from(contests.values()),
    joinContest,
    joinUserRoom,
    leaveContest,
    getSubmissionStatus,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
