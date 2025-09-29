import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import Loading from './Loading'

const ProtectedRoute = ({ children }) =>{
    const { isAuthenticated, loading } = useAuth();

    if(loading) return <Loading />

    return isAuthenticated ? children : <Navigate to= '/' replace />;
}

export default ProtectedRoute;