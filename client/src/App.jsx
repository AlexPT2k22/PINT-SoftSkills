import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Inicio from "./inicio";
import AuthPage from "./authpage";
import LinkedIn_Page from "./linkedin.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Inicio />}></Route>
        <Route path="/auth" element={<AuthPage />}></Route>
        <Route path="/" element={<Navigate to={"/login"} />}></Route>
        <Route path="/linkedin" element={<LinkedIn_Page />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
