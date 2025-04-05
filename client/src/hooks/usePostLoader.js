import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchPostsByTags, fetchRemainingPosts } from '../utility/fetchPost';

export const usePostLoader = (user) => {
  const [posts, setPosts] = useState([]);
  const [pageTags, setPageTags] = useState(1);
  const [pageRemaining, setPageRemaining] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [tagPostsExhausted, setTagPostsExhausted] = useState(false);
  const [allPostsExhausted, setAllPostsExhausted] = useState(false);

  const observer = useRef();
  const fetchLock = useRef(false); // Prevents double-fetch

  const lastPostRef = useCallback((node) => {
    if (isLoading || allPostsExhausted ) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading) {
        loadMorePosts();
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, allPostsExhausted]);

  const loadMorePosts = async () => {
    if (allPostsExhausted || isLoading || fetchLock.current) return;
    setIsLoading(true);
    fetchLock.current = true; // Lock the fetch
    try {
      let newPosts = [];

      if (!tagPostsExhausted) {
        newPosts = await fetchPostsByTags(user.subscribedTopics, pageTags, 10);
        if (newPosts.length === 0) {
          setTagPostsExhausted(true);
        } else {
          setPageTags(prev => prev + 1);
        }
      }

      if (tagPostsExhausted) {
        const rem = await fetchRemainingPosts(user.subscribedTopics, pageRemaining, 10);
        if (rem.length === 0) {
          setAllPostsExhausted(true);
        } else {
          newPosts = rem;
          setPageRemaining(prev => prev + 1);
        }
      }

      setPosts(prev => [...prev, ...newPosts]);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setIsLoading(false);
      fetchLock.current = false; // Unlock fetch for next scroll
    }
  };

  useEffect(() => {
    loadMorePosts();
  }, []);

  return {
    posts,
    isLoading,
    lastPostRef,
    allPostsExhausted,
  };
};
