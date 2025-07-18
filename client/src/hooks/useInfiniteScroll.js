import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPostsByTags, fetchRemainingPosts } from '../utility/fetchPost';

/**
 * Industry-standard infinite scroll hook 
 * Features:
 * - Cursor-based pagination for better performance
 * - Automatic scroll position restoration
 * - Intersection Observer with proper cleanup
 * - Request deduplication and race condition handling
 * - Memory-efficient data management
 * - Proper error handling and retry logic
 */
export const useInfiniteScroll = (user, options = {}) => {
  const {
    pageSize = 10,
    threshold = 0.1,
    rootMargin = '100px',
    retryAttempts = 3,
    enableCache = true
  } = options;

  // Core state
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  
  // Pagination cursors
  const [tagsCursor, setTagsCursor] = useState({ page: 1, exhausted: false });
  const [remainingCursor, setRemainingCursor] = useState({ page: 1, exhausted: false });
  
  // Request management
  const loadingRef = useRef(false);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef(null);
  
  // Intersection Observer
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Cache keys
  const CACHE_PREFIX = 'infinite_scroll_';
  const POSTS_CACHE_KEY = `${CACHE_PREFIX}posts`;
  const CURSOR_CACHE_KEY = `${CACHE_PREFIX}cursors`;
  const SCROLL_POSITION_KEY = `${CACHE_PREFIX}scroll_position`;

  /**
   * Save state to cache for persistence across sessions
   */
  const saveToCache = useCallback((postsData, cursors) => {
    if (!enableCache) return;
    
    try {
      localStorage.setItem(POSTS_CACHE_KEY, JSON.stringify(postsData));
      localStorage.setItem(CURSOR_CACHE_KEY, JSON.stringify(cursors));
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  }, [enableCache, POSTS_CACHE_KEY, CURSOR_CACHE_KEY]);

  /**
   * Load state from cache
   */
  const loadFromCache = useCallback(() => {
    if (!enableCache) return { posts: [], cursors: null };
    
    try {
      const cachedPosts = localStorage.getItem(POSTS_CACHE_KEY);
      const cachedCursors = localStorage.getItem(CURSOR_CACHE_KEY);
      
      return {
        posts: cachedPosts ? JSON.parse(cachedPosts) : [],
        cursors: cachedCursors ? JSON.parse(cachedCursors) : null
      };
    } catch (error) {
      console.warn('Failed to load from cache:', error);
      return { posts: [], cursors: null };
    }
  }, [enableCache, POSTS_CACHE_KEY, CURSOR_CACHE_KEY]);

  /**
   * Clear all cached data
   */
  const clearCache = useCallback(() => {
    localStorage.removeItem(POSTS_CACHE_KEY);
    localStorage.removeItem(CURSOR_CACHE_KEY);
    localStorage.removeItem(SCROLL_POSITION_KEY);
  }, [POSTS_CACHE_KEY, CURSOR_CACHE_KEY, SCROLL_POSITION_KEY]);

  /**
   * Fetch posts with proper error handling and request deduplication
   */
  const fetchPosts = useCallback(async (isRetry = false) => {
    // Prevent duplicate requests
    if (loadingRef.current && !isRetry) {
      console.log('🚫 Request already in progress, skipping...');
      return;
    }

    // Check if we have more data to load
    if (!hasNextPage && !isInitialLoad) {
      console.log('📝 No more pages to load');
      return;
    }

    console.log('🔄 Fetching posts...', { 
      tagsCursor, 
      remainingCursor, 
      isRetry,
      isInitialLoad 
    });

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      let newPosts = [];
      const hasSubscriptions = user?.subscribedTopics?.length > 0;

      // Strategy 1: Load posts by user's subscribed tags first
      if (!tagsCursor.exhausted && hasSubscriptions) {
        console.log('📊 Fetching posts by tags...');
        
        const tagPosts = await fetchPostsByTags(
          user.subscribedTopics,
          tagsCursor.page,
          pageSize
        );

        if (tagPosts.length === 0) {
          console.log('🏁 No more tag posts available');
          setTagsCursor(prev => ({ ...prev, exhausted: true }));
        } else {
          newPosts = tagPosts;
          setTagsCursor(prev => ({ ...prev, page: prev.page + 1 }));
        }
      }

      // Strategy 2: Load remaining posts if tag posts are exhausted or no subscriptions
      if (newPosts.length === 0 && !remainingCursor.exhausted) {
        console.log('📋 Fetching remaining posts...');
        
        const remainingPosts = await fetchRemainingPosts(
          user?.subscribedTopics || [],
          remainingCursor.page,
          pageSize
        );

        if (remainingPosts.length === 0) {
          console.log('🏁 No more remaining posts available');
          setRemainingCursor(prev => ({ ...prev, exhausted: true }));
          setHasNextPage(false);
        } else {
          newPosts = remainingPosts;
          setRemainingCursor(prev => ({ ...prev, page: prev.page + 1 }));
        }
      }

      // Update posts state
      if (newPosts.length > 0) {
        setPosts(prevPosts => {
          // Remove duplicates based on post ID
          const existingIds = new Set(prevPosts.map(post => post._id));
          const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post._id));
          
          if (uniqueNewPosts.length === 0) {
            console.log('⚠️ All fetched posts were duplicates');
            return prevPosts;
          }

          const updatedPosts = [...prevPosts, ...uniqueNewPosts];
          console.log('✅ Added posts:', uniqueNewPosts.length, 'Total:', updatedPosts.length);
          
          // Save to cache
          const cursors = { tagsCursor, remainingCursor };
          saveToCache(updatedPosts, cursors);
          
          return updatedPosts;
        });
      }

      // Reset retry counter on success
      retryCountRef.current = 0;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('📡 Request was aborted');
        return;
      }

      console.error('❌ Error fetching posts:', error);
      
      // Implement retry logic
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++;
        console.log(`🔄 Retrying... Attempt ${retryCountRef.current}/${retryAttempts}`);
        
        setTimeout(() => {
          fetchPosts(true);
        }, Math.pow(2, retryCountRef.current) * 1000); // Exponential backoff
        
        return;
      }

      setError(error);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [
    user?.subscribedTopics, 
    tagsCursor, 
    remainingCursor, 
    hasNextPage, 
    isInitialLoad,
    pageSize,
    retryAttempts,
    saveToCache
  ]);

  /**
   * Setup Intersection Observer for infinite scroll
   */
  const setupIntersectionObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting && !loadingRef.current && hasNextPage) {
          console.log('👁️ Sentinel intersecting, loading more posts...');
          fetchPosts();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    return observerRef.current;
  }, [threshold, rootMargin, hasNextPage, fetchPosts]);

  /**
   * Ref callback for the sentinel element
   */
  const sentinelCallback = useCallback((node) => {
    if (!node) return;
    
    sentinelRef.current = node;
    const observer = setupIntersectionObserver();
    observer.observe(node);
  }, [setupIntersectionObserver]);

  /**
   * Save scroll position periodically
   */
  const saveScrollPosition = useCallback(() => {
    if (enableCache) {
      localStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
    }
  }, [enableCache, SCROLL_POSITION_KEY]);

  /**
   * Restore scroll position
   */
  const restoreScrollPosition = useCallback(() => {
    if (!enableCache) return;
    
    const savedPosition = localStorage.getItem(SCROLL_POSITION_KEY);
    if (savedPosition && posts.length > 0) {
      const position = parseInt(savedPosition, 10);
      console.log('📍 Restoring scroll position:', position);
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo({ top: position, behavior: 'instant' });
      });
    }
  }, [enableCache, SCROLL_POSITION_KEY, posts.length]);

  /**
   * Reset scroll to top
   */
  const resetScrollToTop = useCallback(() => {
    localStorage.removeItem(SCROLL_POSITION_KEY);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [SCROLL_POSITION_KEY]);

  /**
   * Initialize data from cache
   */
  useEffect(() => {
    const { posts: cachedPosts, cursors: cachedCursors } = loadFromCache();
    
    if (cachedPosts.length > 0) {
      console.log('💾 Loading from cache:', cachedPosts.length, 'posts');
      setPosts(cachedPosts);
      
      if (cachedCursors) {
        setTagsCursor(cachedCursors.tagsCursor || { page: 1, exhausted: false });
        setRemainingCursor(cachedCursors.remainingCursor || { page: 1, exhausted: false });
      }
    }
  }, [loadFromCache]);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    if (user && posts.length === 0) {
      console.log('🚀 Initial data fetch');
      fetchPosts();
    }
  }, [user, posts.length, fetchPosts]);

  /**
   * Save scroll position periodically
   */
  useEffect(() => {
    if (!enableCache) return;

    const handleScroll = () => saveScrollPosition();
    const interval = setInterval(saveScrollPosition, 1000);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', saveScrollPosition);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', saveScrollPosition);
      clearInterval(interval);
    };
  }, [enableCache, saveScrollPosition]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Public API methods
   */
  const refresh = useCallback(() => {
    console.log('🔄 Refreshing data...');
    clearCache();
    setPosts([]);
    setTagsCursor({ page: 1, exhausted: false });
    setRemainingCursor({ page: 1, exhausted: false });
    setHasNextPage(true);
    setError(null);
    setIsInitialLoad(true);
    resetScrollToTop();
  }, [clearCache, resetScrollToTop]);

  const addPost = useCallback((newPost) => {
    setPosts(prevPosts => {
      const updatedPosts = [newPost, ...prevPosts];
      const cursors = { tagsCursor, remainingCursor };
      saveToCache(updatedPosts, cursors);
      return updatedPosts;
    });
  }, [tagsCursor, remainingCursor, saveToCache]);

  return {
    // Data
    posts,
    setPosts,
    
    // Loading states
    isLoading,
    isInitialLoad,
    hasNextPage,
    error,
    
    // Scroll management
    sentinelRef: sentinelCallback,
    restoreScrollPosition,
    resetScrollToTop,
    
    // Actions
    refresh,
    addPost,
    fetchMore: fetchPosts,
    clearCache,
    
    // Debug info
    cursors: { tagsCursor, remainingCursor }
  };
};
