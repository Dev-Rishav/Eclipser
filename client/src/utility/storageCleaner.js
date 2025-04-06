export const clearPostCache = () => {
    const keysToPreserve = ['authToken', 'user'];
  
    Object.keys(localStorage).forEach((key) => {
      if (!keysToPreserve.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  };
  