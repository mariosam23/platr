import { Link, useNavigate } from 'react-router-dom';
import { PlatrRoutes } from '../application/routes';
import { logout } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import '../styles/NavBar.css';

const NavBar = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { token, user } = useAppSelector((state) => state.auth);
    const isAuthenticated = !!token;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Plat<span>r</span></Link>
            </div>
            <ul className="navbar-links">
                <li><Link to={PlatrRoutes.Home}>Home</Link></li>
                <li><Link to={PlatrRoutes.Recipes}>Recipes</Link></li>
                <li><Link to={PlatrRoutes.MealPlans}>Meal Plans</Link></li>
                <li><Link to={PlatrRoutes.Reviews}>Reviews</Link></li>
                
                {!isAuthenticated ? (
                    <>
                        <li><Link to="/login" className="nav-btn">Login</Link></li>
                        <li><Link to="/register" className="nav-btn nav-btn-primary">Register</Link></li>
                    </>
                ) : (
                    <>
                        {user && <li className="nav-username">{user.displayName}</li>}
                        <li><button className="nav-btn nav-btn-danger" onClick={handleLogout}>Logout</button></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default NavBar;