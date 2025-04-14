import Login from "./components/Login.jsx"
import Slides from "./components/Slides.jsx";

function Inicio() {
  return (
    <div className="login-container">
      <Slides />
      <Login />
    </div>
  );
}

export default Inicio;