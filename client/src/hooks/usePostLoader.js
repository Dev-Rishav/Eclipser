import { useState, useEffect, useRef, useCallback } from "react";
import { fetchPostsByTags, fetchRemainingPosts } from "../utility/fetchPost";
import { io } from "socket.io-client";

const CACHE_KEY = "cached_posts";
const TAG_PAGE_KEY = "cached_page_tags";
const REMAINING_PAGE_KEY = "cached_page_remaining";
const EXHAUST_TAG_KEY = "tag_posts_exhausted";
const EXHAUST_ALL_KEY = "all_posts_exhausted";

// const socket = io('http://localhost:3000');

export const usePostLoader = (user) => {
  const [posts, setPosts] = useState(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });

  const [pageTags, setPageTags] = useState(
    () => parseInt(localStorage.getItem(TAG_PAGE_KEY)) || 1
  );
  const [pageRemaining, setPageRemaining] = useState(
    () => parseInt(localStorage.getItem(REMAINING_PAGE_KEY)) || 1
  );
  const [isLoading, setIsLoading] = useState(false);
  const [tagPostsExhausted, setTagPostsExhausted] = useState(
    () => localStorage.getItem(EXHAUST_TAG_KEY) === "true"
  );
  const [allPostsExhausted, setAllPostsExhausted] = useState(
    () => localStorage.getItem(EXHAUST_ALL_KEY) === "true"
  );
  const [livePosts, setLivePosts] = useState([]);

  const observer = useRef();
  const fetchLock = useRef(false); // Prevent multiple fetches at once

  const persistToStorage = (
    newPosts,
    tagPage,
    remainingPage,
    tagsDone,
    allDone
  ) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(newPosts));
    localStorage.setItem(TAG_PAGE_KEY, tagPage);
    localStorage.setItem(REMAINING_PAGE_KEY, remainingPage);
    localStorage.setItem(EXHAUST_TAG_KEY, tagsDone);
    localStorage.setItem(EXHAUST_ALL_KEY, allDone);
  };

  // Intersection Observer to detect when the last post is in view
  //? what is intersection observer?
  //* The Intersection Observer API is a browser API that allows you to asynchronously observe changes in the intersection of a target element with an ancestor element or with a top-level document's viewport.
  //? how does it work?
  //* It works by creating an observer instance and passing it a callback function that will be called whenever the target element enters or exits the viewport. You can specify options such as the root element, root margin, and threshold to control when the callback is triggered.
  const lastPostRef = useCallback(
    (node) => {
      if (isLoading || allPostsExhausted) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMorePosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, allPostsExhausted]
  );

  const loadMorePosts = async () => {
    if (allPostsExhausted || isLoading || fetchLock.current) return;

    setIsLoading(true);
    fetchLock.current = true;

    try {
      let newPosts = [];

      //handling the case where user has no subscriptions
      const hasSubscriptions = user.subscribedTopics?.length > 0;
      console.log("hasSubscriptions:", hasSubscriptions);

      if (!hasSubscriptions) {
        setTagPostsExhausted(true);
        localStorage.setItem(EXHAUST_TAG_KEY, "true");
        const rem = await fetchRemainingPosts(
          user.subscribedTopics,
          pageRemaining,
          10
        );
        console.log("Remaining posts:", rem);

        if (rem.length === 0) {
          setAllPostsExhausted(true);
          localStorage.setItem(EXHAUST_ALL_KEY, "true");
        } else {
          newPosts = rem;
          setPageRemaining((prev) => {
            const updated = prev + 1;
            localStorage.setItem(REMAINING_PAGE_KEY, updated);
            return updated;
          });
        }
      }

      if (!tagPostsExhausted && hasSubscriptions) {
        newPosts = await fetchPostsByTags(user.subscribedTopics, pageTags, 10);
        if (newPosts.length === 0) {
          setTagPostsExhausted(true);
          localStorage.setItem(EXHAUST_TAG_KEY, "true");
        } else {
          setPageTags((prev) => {
            const updated = prev + 1;
            localStorage.setItem(TAG_PAGE_KEY, updated);
            return updated;
          });
        }
      }

      if (tagPostsExhausted && hasSubscriptions) {
        console.log("Fetching remaining posts...");

        const rem = await fetchRemainingPosts(
          user.subscribedTopics,
          pageRemaining,
          10
        );
        console.log("Remaining posts:", rem);

        if (rem.length === 0) {
          setAllPostsExhausted(true);
          localStorage.setItem(EXHAUST_ALL_KEY, "true");
        } else {
          newPosts = rem;
          setPageRemaining((prev) => {
            const updated = prev + 1;
            localStorage.setItem(REMAINING_PAGE_KEY, updated);
            return updated;
          });
        }
      }

      if (newPosts.length > 0) {
        setPosts((prev) => {
          const combined = [...prev, ...newPosts];
          persistToStorage(
            combined,
            pageTags,
            pageRemaining,
            tagPostsExhausted,
            allPostsExhausted
          );
          return combined;
        });
      }
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    } finally {
      setIsLoading(false);
      fetchLock.current = false; // Unlock fetch for next scroll
    }
  };

  //load more posts when the component mounts
  useEffect(() => {
    if (posts.length === 0) loadMorePosts();
  }, []);

  //   useEffect(() => {

  //     socket.on('newPost', (post) => {
  //       const isSubscribed = user.subscribedTopics.some(tag => post.tags.includes(tag));
  //       if (isSubscribed) {
  //         setLivePosts(prev => [post, ...prev]);
  //       }
  //     });

  //     return () => socket.disconnect();
  //   }, []);

  return {
    posts,
    setPosts,
    isLoading,
    lastPostRef,
    allPostsExhausted,
    livePosts,
    setLivePosts,
  };
};
