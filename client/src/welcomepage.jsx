import React from "react";
import { useEffect, useState } from "react";
import Navbar from "./components/navbar.jsx";
import Loader from "./components/loader.jsx";
import useAuthStore from "./store/authStore.js";
import "./styles/welcomepage.css";
import CourseCard from "./components/course_card.jsx";

const courses = [
  {
    titulo: "Curso de Exemplo",
    imagem: "https://placehold.co/150",
    tipo: "Tipo de Curso",
    tempoTotal: "10 horas",
    id: "1",
    dataInicio: "2023-01-01",
    dataFim: "2023-12-31",
  },
  {
    titulo: "Curso de Exemplo 2",
    imagem: "https://placehold.co/150",
    tipo: "Tipo de Curso 2",
    tempoTotal: "20 horas",
    id: "2",
    dataInicio: "2023-02-01",
    dataFim: "2023-11-30",
  },
  {
    titulo: "Curso de Exemplo 3",
    imagem: "https://placehold.co/150",
    tipo: "Tipo de Curso 3",
    tempoTotal: "15 horas",
    id: "3",
    dataInicio: "2023-03-01",
    dataFim: "2023-10-31",
  },
];

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

      <div className="container d-flex flex-column mt-5">
        <div className="d-flex justify-content-start">
          <h2>Os mais populares</h2>
        </div>
        <div className="d-flex flex-row mt-2">
          {courses.map((course) => (
            <div className="me-3" key={course.id}>
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default WelcomePage;
