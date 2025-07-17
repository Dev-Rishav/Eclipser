import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import { memo } from "react";
import Home from "../pages/Home";
import Contest from "../pages/Contest";
import Profile from "../pages/Profile";
import PostList from "../pages/PostList";
import Feed from "./newUI/Feed";

// Memoized layout component to prevent re-renders
const PersistentLayout = memo(() => (
    <Layout>
      <Routes>
        {/* All authenticated routes will be rendered here */}
        <Route path="/" element={<Feed />} />
        <Route path="/contest" element={<Contest />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feed" element={<Feed />} />
        {/* <Route path="/posts" element={<PostList />} /> */}
      </Routes>
    </Layout>
  ));

export default PersistentLayout;

