import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import { memo } from "react";
import Home from "../pages/Home";
import Contest from "./Contest";

// Memoized layout component to prevent re-renders
const PersistentLayout = memo(() => (
    <Layout>
      <Routes>
        {/* All authenticated routes will be rendered here */}
        <Route path="/" element={<Home />} />
        <Route path="/contest" element={<Contest />} />
      </Routes>
    </Layout>
  ));

export default PersistentLayout;

