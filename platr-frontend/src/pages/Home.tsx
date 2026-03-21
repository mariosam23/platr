import React from 'react';
import { Button } from '../components/Button';

export const Home: React.FC = () => {
    return (
        <div>
            <h1>Welcome to Platr</h1>
            <p>Your frontend is starting to take shape!</p>
            <Button label="Click Me" onClick={() => alert('Button clicked!')} />
        </div>
    );
};
