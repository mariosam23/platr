import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlatrRoutes } from './application/routes';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Feedback } from './pages/Feedback';
import { MealPlanDetail } from './pages/MealPlanDetail';
import { MealPlans } from './pages/MealPlans';
import { RecipeDetail } from './pages/RecipeDetail';
import { Recipes } from './pages/Recipes';
import { Register } from './pages/Register';
import { Reviews } from './pages/Reviews';
import './styles/App.css';

function App() {
    return (
        <BrowserRouter>
            <NavBar />
            <div className="container">
                <Routes>
                    <Route path={PlatrRoutes.Home} element={<Home />} />
                    <Route path={PlatrRoutes.Login} element={<Login />} />
                    <Route path={PlatrRoutes.Register} element={<Register />} />
                    <Route path={PlatrRoutes.Feedback} element={<Feedback />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path={PlatrRoutes.Recipes} element={<Recipes />} />
                        <Route path={PlatrRoutes.RecipeDetail} element={<RecipeDetail />} />
                        <Route path={PlatrRoutes.MealPlans} element={<MealPlans />} />
                        <Route path={PlatrRoutes.MealPlanDetail} element={<MealPlanDetail />} />
                        <Route path={PlatrRoutes.Reviews} element={<Reviews />} />
                    </Route>
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
