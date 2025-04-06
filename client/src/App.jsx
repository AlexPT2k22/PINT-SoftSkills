import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Inicio from "./inicio";
import AuthPage from "./authpage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Inicio />}></Route>
        <Route path="/auth" element={<AuthPage />}></Route>
        <Route path="/" element={<Navigate to={"/login"} />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
