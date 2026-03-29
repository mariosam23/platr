import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import './styles/App.css';
import { Register } from './pages/Register';
import { MealPlanDetail } from './pages/MealPlanDetail';
import { MealPlans } from './pages/MealPlans';
import { Feedback } from './pages/Feedback';
import { RecipeDetail } from './pages/RecipeDetail';
import { Recipes } from './pages/Recipes';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/mealplans" element={<MealPlans />} />
            <Route path="/mealplans/:id" element={<MealPlanDetail />} />
            <Route path="/feedback" element={<Feedback />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
