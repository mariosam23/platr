import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import { Home } from './pages/Home';
import './styles/App.css';
import { Register } from './pages/Register';

// Placeholder Pages
const Login = () => <div className="page"><h1>Login</h1></div>;
const RecipesTable = () => <div className="page"><h1>Recipes</h1></div>;
const MealPlansTable = () => <div className="page"><h1>Meal Plans</h1></div>;
const FeedbackForm = () => <div className="page"><h1>Feedback</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recipes" element={<RecipesTable />} />
          <Route path="/mealplans" element={<MealPlansTable />} />
          <Route path="/feedback" element={<FeedbackForm />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
