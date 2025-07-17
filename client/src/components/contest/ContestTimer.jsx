import { useState, useEffect } from 'react';

export default function ContestTimer({ startTime, endTime, status }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();

      if (now < start) {
        // Contest hasn't started
        const distance = start - now;
        setTimeLeft(formatTime(distance));
        setIsActive(false);
      } else if (now >= start && now < end) {
        // Contest is running
        const distance = end - now;
        setTimeLeft(formatTime(distance));
        setIsActive(true);
      } else {
        // Contest has ended
        setTimeLeft('Contest Ended');
        setIsActive(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime]);

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`px-4 py-2 rounded-lg border font-mono text-lg font-bold ${
      isActive 
        ? 'bg-green-900/30 text-green-300 border-green-500/30' 
        : 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30'
    }`}>
      <div className="text-xs text-center mb-1">
        {isActive ? '⏰ Time Remaining' : '⏳ Starts In'}
      </div>
      <div className="text-center">
        {timeLeft}
      </div>
    </div>
  );
}