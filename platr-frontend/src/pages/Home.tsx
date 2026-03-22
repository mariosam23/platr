import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
    return (
        <div className="page">
            <h1>Welcome to Platr</h1>
            <p>Your recipe management and meal planning application.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <Link to="/recipes" className="nav-btn nav-btn-primary">View Recipes</Link>
                <Link to="/mealplans" className="nav-btn nav-btn-primary">View Meal Plans</Link>
            </div>
        </div>
    );
};
