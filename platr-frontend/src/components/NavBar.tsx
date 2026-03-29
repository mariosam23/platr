import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import '../styles/NavBar.css';

const NavBar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, user } = useSelector((state: RootState) => state.auth);
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
                <li><Link to="/">Home</Link></li>
                <li><Link to="/recipes">Recipes</Link></li>
                <li><Link to="/mealplans">Meal Plans</Link></li>
                
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