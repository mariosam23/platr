import { Link } from 'react-router-dom';
import '../styles/NavBar.css';

const NavBar = () => {
    const isAuthenticated = false; // todo

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Platr</Link>
            </div>
            <ul className="navbar-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/recipes">Recipes</Link></li>
                <li><Link to="/mealplans">Meal Plans</Link></li>
                <li><Link to="/feedback">Feedback</Link></li>
                
                {!isAuthenticated ? (
                    <>
                        <li><Link to="/login" className="nav-btn">Login</Link></li>
                        <li><Link to="/register" className="nav-btn nav-btn-primary">Register</Link></li>
                    </>
                ) : (
                    <li><button className="nav-btn nav-btn-danger">Logout</button></li>
                )}
            </ul>
        </nav>
    );
};

export default NavBar;