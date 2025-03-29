import "./App.css";
import "./inicio";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Inicio from "./inicio";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Inicio />}></Route>
        <Route path="/" element={<Inicio />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
