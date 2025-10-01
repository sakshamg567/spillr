import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AuthRoute from './components/AuthRoute';
import './App.css';
import Loading from './components/Loading'
const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./components/Dashboard'));
const CreateWall = lazy(() => import('./components/CreateWall'));
const OwnerWallView = lazy(() => import('./components/OwnerWallView'));
const WallPublic = lazy(() => import('./components/PublicWallView'));
const Login = lazy(()=> import('./components/auth/LoginForm'))
const ResetPassword = lazy(() => import('./components/auth/ResetPasswordForm'))
const Setting = lazy(()=>import ('./components/UserSettings'))

export default function App(){
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/wall/:wallId" element={<WallPublic />} />
        
       
        <Route element={<AuthRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={< Setting/>} />
          <Route path="/wall/create" element={<CreateWall />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}