import "./App.css";
import Login from "./components/Login.jsx";
import Slides from "./components/Slides.jsx";

function App() {
  return (
    <div className="login-container">
      {/*Parte esquerda com os slides*/}
      <Slides />
      {/*Parte direita com o login*/}
      <Login />
    </div>
  );
}

export default App;
