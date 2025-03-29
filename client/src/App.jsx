import "./App.css";
import Login from "./components/Login.jsx";
import Slides from "./components/Slides.jsx";
import axios from "axios";
import { use, useEffect } from "react";

function App() {
  const fetchAPI_TESTE = async () => {
    const response = await axios.get("http://localhost:8080/api");
    console.log(response.data.fruits);
  };

  useEffect(() => {
    fetchAPI_TESTE();
  }, []);

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
