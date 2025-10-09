// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthRoute from "./components/AuthRoute";
import "./App.css";
import Loading from "./components/Loading";
import Settings from "./components/UserSettings";
import PublicWallView from "./components/PublicWallView";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./components/Dashboard"));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
       
        <Route path="/" element={<Home />} />
        
          <Route path="/public/wall/:username" element={<PublicWallView />} />
    
        <Route element={<AuthRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}