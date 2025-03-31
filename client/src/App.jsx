import "./App.css";
import "./inicio";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Inicio from "./inicio";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Inicio />}></Route>
        <Route path="/" element={<Navigate to={"/login"} />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
