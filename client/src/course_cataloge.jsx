import React from "react";
import { useEffect, useState } from "react";
import Navbar from "./components/navbar";
import Loader from "./components/loader.jsx";
import useAuthStore from "./store/authStore.js";

function CouseCatalogue() {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  //FIXME: Não está a funcionar
  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div
          id="carouselExample"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="3000"
        >
          <div className="carousel-indicators">
            <button
              type="button"
              data-bs-target="#carouselExample"
              data-bs-slide-to="0"
              className="active"
              aria-current="true"
              aria-label="Slide 1"
            ></button>
            <button
              type="button"
              data-bs-target="#carouselExample"
              data-bs-slide-to="1"
              aria-label="Slide 2"
            ></button>
            <button
              type="button"
              data-bs-target="#carouselExample"
              data-bs-slide-to="2"
              aria-label="Slide 3"
            ></button>
          </div>

          <div className="carousel-inner">
            <div className="carousel-item active">
              <img
                src="https://via.placeholder.com/800x400?text=Slide+1"
                className="d-block w-100"
                alt="Slide 1"
              />
              <div className="carousel-caption d-none d-md-block">
                <h5>Título do Slide 1</h5>
                <p>Descrição opcional para o primeiro slide.</p>
              </div>
            </div>
            <div className="carousel-item">
              <img
                src="https://via.placeholder.com/800x400?text=Slide+2"
                className="d-block w-100"
                alt="Slide 2"
              />
              <div className="carousel-caption d-none d-md-block">
                <h5>Título do Slide 2</h5>
                <p>Descrição opcional para o segundo slide.</p>
              </div>
            </div>
            <div className="carousel-item">
              <img
                src="https://via.placeholder.com/800x400?text=Slide+3"
                className="d-block w-100"
                alt="Slide 3"
              />
              <div className="carousel-caption d-none d-md-block">
                <h5>Título do Slide 3</h5>
                <p>Descrição opcional para o terceiro slide.</p>
              </div>
            </div>
          </div>

          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselExample"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Anterior</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselExample"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Próximo</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default CouseCatalogue;
