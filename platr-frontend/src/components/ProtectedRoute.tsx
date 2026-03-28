import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppStore';
import { PlatrRoutes } from '../application/routes';

const ProtectedRoute = () => {
    const token = useAppSelector((state) => state.auth.token);

    if (!token) {
        return <Navigate to={PlatrRoutes.Login} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
