import { useDispatch} from 'react-redux';
import { useCallback } from 'react';
import { patchUserTopics as setUserAction } from '../Redux/actions/authActions'; // Adjust path as needed

const useUpdateTags = () => {
  const dispatch = useDispatch();

  const updateTags = useCallback(
    async (targetTopic, isRemoving) => {
      try {
        dispatch(setUserAction(targetTopic,isRemoving));

        console.log(`✅ Successfully ${isRemoving ? 'removed' : 'added'} topic: ${targetTopic}`);
      } catch (error) {
        console.error('❌ Error updating subscribed topics:', error.message);
      }
    },
    [dispatch]
  );

  return updateTags;
};

export default useUpdateTags;