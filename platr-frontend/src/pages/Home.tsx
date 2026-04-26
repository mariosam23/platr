import React from 'react';
import { Link } from 'react-router-dom';
import { PlatrRoutes } from '../application/routes';
import { IconMealCalendar, IconRecipeLibrary, IconReviews } from '../components/icons/FeatureIcons';
import '../styles/Home.css';

const FEATURES = [
    {
        Icon: IconRecipeLibrary,
        title: 'Recipe Library',
        description: 'Browse, search, and save recipes from a growing community collection.',
    },
    {
        Icon: IconMealCalendar,
        title: 'Meal Planning',
        description: 'Drag recipes onto your weekly calendar and generate a shopping list in one click.',
    },
    {
        Icon: IconReviews,
        title: 'Reviews & Feedback',
        description: 'Rate recipes, leave notes, and discover what the community is cooking.',
    },
];

export const Home: React.FC = () => (
    <>
        <section className="hero">
            <div className="hero-inner">
                <span className="hero-eyebrow">Your kitchen, organised</span>
                <h1 className="hero-title">
                    Cook smarter with <span>Platr</span>
                </h1>
                <p className="hero-subtitle">
                    Save recipes, plan your meals for the week, and build shopping lists — all in one place.
                </p>
                <div className="hero-actions">
                    <Link to={PlatrRoutes.Recipes} className="nav-btn nav-btn-primary">
                        Browse Recipes
                    </Link>
                    <Link to={PlatrRoutes.Register} className="nav-btn">
                        Create free account
                    </Link>
                </div>
            </div>
        </section>

        <section className="features">
            {FEATURES.map(({ Icon, title, description }) => (
                <article key={title} className="feature-card">
                    <div className="feature-icon-frame" aria-hidden>
                        <Icon className="feature-icon-svg" />
                    </div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                </article>
            ))}
        </section>
    </>
);
