import React from 'react';
import { Link } from 'react-router-dom';
import { PlatrRoutes } from '../application/routes';
import '../styles/Home.css';

const FEATURES = [
    {
        icon: '🍽️',
        title: 'Recipe Library',
        description: 'Browse, search, and save recipes from a growing community collection.',
    },
    {
        icon: '📅',
        title: 'Meal Planning',
        description: 'Drag recipes onto your weekly calendar and generate a shopping list in one click.',
    },
    {
        icon: '⭐',
        title: 'Reviews & Feedback',
        description: 'Rate recipes, leave notes, and discover what the community is cooking.',
    },
];

export const Home: React.FC = () => (
    <>
        <section className="hero">
            <span className="hero-eyebrow">Your kitchen, organised</span>
            <h1 className="hero-title">
                Cook smarter with <span>Platr</span>
            </h1>
            <p className="hero-subtitle">
                Save recipes, plan your meals for the week, and build shopping lists — all in one place.
            </p>
            <div className="hero-actions">
                <Link to={PlatrRoutes.Recipes} className="nav-btn nav-btn-primary">Browse Recipes</Link>
                <Link to={PlatrRoutes.Register} className="nav-btn">Create free account</Link>
            </div>
        </section>

        <section className="features">
            {FEATURES.map((f) => (
                <div key={f.title} className="feature-card">
                    <div className="feature-icon">{f.icon}</div>
                    <h3>{f.title}</h3>
                    <p>{f.description}</p>
                </div>
            ))}
        </section>
    </>
);
