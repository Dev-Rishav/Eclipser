const BADGES = {
    NOVICE: { threshold: 1200, name: 'Code Novice', icon: '🥉' },
    ADEPT: { threshold: 1400, name: 'Code Adept', icon: '🥈' },
    MASTER: { threshold: 1600, name: 'Code Master', icon: '🥇' }
  };
  
  async function checkBadges(userId) {
    const user = await User.findById(userId);
    const newBadges = [];
    
    for (const [key, badge] of Object.entries(BADGES)) {
      if (user.rating.current >= badge.threshold && 
          !user.badges.some(b => b.name === badge.name)) {
        newBadges.push({
          name: badge.name,
          icon: badge.icon,
          awardedAt: new Date()
        });
      }
    }
    
    if (newBadges.length > 0) {
      await User.updateOne(
        { _id: userId },
        { $push: { badges: { $each: newBadges } } }
      );
    }
    
    return newBadges;
  }