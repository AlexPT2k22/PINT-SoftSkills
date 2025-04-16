import React from "react";
import { useEffect, useState } from "react";
import Navbar from "./components/navbar.jsx";
import Loader from "./components/loader.jsx";
import useAuthStore from "./store/authStore.js";
import "./styles/welcomepage.css";

function WelcomePage() {
  //FIXME: Não está a funcionar
  return (
    <>
      <Navbar />
      <div className="container d-flex justify-content-start banner">
        <div className="p-4 d-flex flex-column justify-content-center ms-5">
          <div className="d-flex flex-column text-start">
            <div className="d-flex flex-column justify-content-start shadow border-2 rounded-3 p-4 message-box">
              <h2>Aprenda novas habilidades</h2>
              <p>Estude com mais de 100 cursos disponiveis!</p>
              <div className="d-flex justify-content-start">
                <button className="btn btn-primary">Começar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomePage;
