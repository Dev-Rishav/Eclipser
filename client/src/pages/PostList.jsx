import React, { useEffect, useState, useRef, useCallback } from 'react';
import { PostCard } from '../components/PostCard';
import { fetchPostsByTags, fetchRemainingPosts } from '../utility/fetchPost';
import { useSelector } from 'react-redux';
import { usePostLoader } from '../hooks/usePostLoader';

const PostList = () => {
  const user = useSelector((state) => state.auth.user);
//   const [posts, setPosts] = useState([]);
//   const [pageTags, setPageTags] = useState(1);
//   const [pageRemaining, setPageRemaining] = useState(1);
//   const [isLoading, setIsLoading] = useState(false);
//   const [tagPostsExhausted, setTagPostsExhausted] = useState(false);
//   const [allPostsExhausted, setAllPostsExhausted] = useState(false);

//   const observer = useRef();
//   const fetchLock = useRef(false); // Prevents double-fetch
  

//   const loadMorePosts = async () => {
//     if (isLoading || allPostsExhausted || fetchLock.current) return;

//     fetchLock.current = true; // Lock the fetch
//     setIsLoading(true);

//     try {
//       let newPosts = [];

//       if (!tagPostsExhausted) {
//         const fetched = await fetchPostsByTags(user.subscribedTopics, pageTags, 10);
//         if (fetched.length === 0) {
//           setTagPostsExhausted(true);
//         } else {
//           newPosts = fetched;
//           setPageTags((prev) => prev + 1);
//         }
//       }

//       if (tagPostsExhausted) {
//         const remaining = await fetchRemainingPosts(user.subscribedTopics, pageRemaining, 10);
//         if (remaining.length === 0) {
//           setAllPostsExhausted(true);
//         } else {
//           newPosts = remaining;
//           setPageRemaining((prev) => prev + 1);
//         }
//       }

//       setPosts((prev) => [...prev, ...newPosts]);
//     } catch (err) {
//       console.error("Error loading posts:", err);
//     } finally {
//       setIsLoading(false);
//       fetchLock.current = false; // Unlock fetch for next scroll
//     }
//   };

//   // Intersection Observer to detect when the last post is in view
//   //? what is intersection observer?
//   //* The Intersection Observer API is a browser API that allows you to asynchronously observe changes in the intersection of a target element with an ancestor element or with a top-level document's viewport.
//   //? how does it work?
//   //* It works by creating an observer instance and passing it a callback function that will be called whenever the target element enters or exits the viewport. You can specify options such as the root element, root margin, and threshold to control when the callback is triggered.
//   const lastPostRef = useCallback((node) => {
//     if (isLoading || allPostsExhausted) return;

//     if (observer.current) observer.current.disconnect();

//     observer.current = new IntersectionObserver((entries) => {
//       if (entries[0].isIntersecting) {
//         loadMorePosts();
//       }
//     });

//     if (node) observer.current.observe(node);
//   }, [isLoading, allPostsExhausted, tagPostsExhausted]);

//   useEffect(() => {
//     loadMorePosts(); // Initial fetch
//   }, []);

const { posts, isLoading, lastPostRef, allPostsExhausted } = usePostLoader(user);

  return (
    <div className="post-list">
      {posts.map((post, index) => {
        const isLast = index === posts.length - 1;
        return (
          <div key={post._id} ref={isLast ? lastPostRef : null}>
            <PostCard post={post} />
          </div>
        );
      })}

      {isLoading && <p className="text-center text-gray-500">Loading...</p>}
      {allPostsExhausted && (
        <p className="text-center text-green-600 font-bold mt-4">
          🌌 You have reached the end of the universe!
        </p>
      )}
    </div>
  );
};

export default PostList;
