// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthRoute from "./components/AuthRoute";
import "./App.css";
import LoadingSpinner from "./components/Loading";
import Settings from "./components/UserSettings";
import PublicWallView from "./components/PublicWallView";
import ResetPasswordForm from './components/auth/ResetPasswordForm'
import "@fontsource/space-grotesk/400.css"
import "@fontsource/space-grotesk/700.css"
import "@fontsource/ibm-plex-mono/400.css"
import "@fontsource/ibm-plex-mono/700.css"

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./components/Dashboard"));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
       
        <Route path="/" element={<Home />} />
        
          <Route path="/wall/:slug" element={<PublicWallView />} />
           <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route element={<AuthRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}