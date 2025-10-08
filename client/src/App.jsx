// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthRoute from "./components/AuthRoute";
import "./App.css";
import Loading from "./components/Loading";
import Settings from "./components/UserSettings";
import Wall from "./components/PublicWallView";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./components/Dashboard"));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        {/* Public Wall - accepts username parameter */}
        <Route path="/wall/:username" element={<Wall />} />

        {/* Protected Routes */}
        <Route element={<AuthRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch-all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}