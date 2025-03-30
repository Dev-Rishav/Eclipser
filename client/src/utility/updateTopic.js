export const updateTopic = async (targetTopic, user, setUser, isRemoving) => {
  try {
    // Determine the action (add or remove)
    // const isRemoving = !!removeTopic; // If `removeTopic` is passed, it's a removal action
    // const targetTopic = isRemoving ? removeTopic : topic;

    // Update the subscribedTopics array
    const updatedTopics = isRemoving
      ? user.subscribedTopics.filter((t) => t !== targetTopic) // Remove the topic
      : [...user.subscribedTopics, targetTopic]; // Add the topic

    // Ensure at least one topic remains subscribed
    if (updatedTopics.length === 0) {
      throw new Error('You must subscribe to at least one topic.');
    }

    // Update the user object
    const updatedUser = { ...user, subscribedTopics: updatedTopics };

    // Update the backend
    const response = await fetch(`http://localhost:3000/api/user/profile/${user._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        subscribedTopics: updatedTopics,
        action: isRemoving ? 'remove' : 'add', // Send action type to backend
        topic: targetTopic, // Send the specific topic being added/removed
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update subscribed topics');
    }

    // Update localStorage and state
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    console.log(`Successfully ${isRemoving ? 'removed' : 'added'} topic: ${targetTopic}`);
  } catch (error) {
    console.error('Error updating subscribed topics:', error.message);
  }
};