import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import { memo } from "react";
import Contest from "../pages/Contest";
import Profile from "../pages/Profile";
import PostList from "../pages/PostList";
import Feed from "./newUI/Feed";
import UnderConstruction from "../pages/UnderConstruction";
import PostDetail from "../pages/PostDetail";
import Communications from "../pages/Communications";
import Profile_backup from "../pages/Profile_backup";

// Memoized layout component to prevent re-renders
const PersistentLayout = memo(() => (
  <Layout>
    <Routes>
      {/* All authenticated routes will be rendered here */}
      <Route path="/" element={<Feed />} />
      <Route path="/contest" element={<Contest />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/topics" element={<UnderConstruction />} />
      <Route path="/discussions" element={<UnderConstruction />} />
      <Route path="/communications" element={<Communications />} />
      <Route path="/help" element={<UnderConstruction />} />
      <Route path="/leaderboard" element={<UnderConstruction />} />
      <Route path="/under-construction" element={<UnderConstruction />} />
      <Route path="/settings" element={<UnderConstruction />} />
      <Route path="/post/:postId" element={<PostDetail />} />
      {/* <Route path="/posts" element={<PostList />} /> */}
    </Routes>
  </Layout>
));

PersistentLayout.displayName = 'PersistentLayout';

export default PersistentLayout;
