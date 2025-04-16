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
    tipo: "Sincrono",
    tempoTotal: "10h",
    id: "1",
    dataInicio: "2023-01-01",
    dataFim: "2023-12-31",
    vagasRestantes: "5",
  },
  {
    titulo: "Curso de Exemplo 2",
    imagem: "https://placehold.co/150",
    tipo: "Assincrono",
    tempoTotal: "20h",
    id: "2",
    dataInicio: "2023-02-01",
    dataFim: "2023-11-30",
    vagasRestantes: "10",
  },
  {
    titulo: "Curso de Exemplo 3",
    imagem: "https://placehold.co/150",
    tipo: "Sincrono",
    tempoTotal: "15h",
    id: "3",
    dataInicio: "2023-03-01",
    dataFim: "2023-10-31",
    vagasRestantes: "2",
  },
  {
    titulo: "Curso de Exemplo 4",
    imagem: "https://placehold.co/150",
    tipo: "Assincrono",
    tempoTotal: "25h",
    id: "4",
    dataInicio: "2023-04-01",
    dataFim: "2023-09-30",
    vagasRestantes: "0",
  },
  {
    titulo: "Curso de Exemplo 5",
    imagem: "https://placehold.co/150",
    tipo: "Sincrono",
    tempoTotal: "30h",
    id: "5",
    dataInicio: "2023-05-01",
    dataFim: "2023-08-31",
    vagasRestantes: "1",
  },
];

function WelcomePage() {
  //TODO: Receber os cursos da API
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
        <div className="d-flex flex-column justify-content-start mb-3">
          <h1>Os mais populares</h1>
          <p className="mb-0">Explore os nossos cursos mais populares e prepare-se para aprender novas habilidades </p>
        </div>
        <div className="container p-0">
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {courses.map((course) => (
              <div className="col" key={course.id}>
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomePage;
