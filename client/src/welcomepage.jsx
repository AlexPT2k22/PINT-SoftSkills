import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "./components/navbar.jsx";
import Loader from "./components/loader.jsx";
import useAuthStore from "./store/authStore.js";
import "./styles/welcomepage.css";
import CourseCard from "./components/course_card.jsx";
import { FileBadge } from "lucide-react";
import { BookOpenCheck } from "lucide-react";
import { MessagesSquare } from "lucide-react";

const URL =
  import.meta.env.PROD === "production"
    ? "https://pint-softskills-api.onrender.com"
    : "http://localhost:4000";

function WelcomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${URL}/api/cursos/popular`);
        console.log("Cursos Populares:", response.data);
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erro a encontrar os cursos populares:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <Loader />;
  }

  //TODO: add error handling UI

  return (
    <>
      <Navbar />
      <div className="container-fluid banner-container">
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
      </div>

      <div className="container d-flex flex-column mt-5">
        <div className="d-flex flex-column justify-content-start mb-3">
          <h1>Os mais populares</h1>
          <p className="mb-2">
            Explore os nossos cursos mais populares e prepare-se para aprender
            novas habilidades
          </p>
        </div>
        <div className="container p-0 mb-3">
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {courses.map((course) => (
              <div className="col" key={course.ID_CURSO}>
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        </div>
        <div className="d-flex justify-content-start mb-3 mt-3">
          <button className="btn btn-primary fs-5">Ver todos os cursos</button>
        </div>

        <div className="container mt-5">
          <div className="row">
            <div className="col-12 col-lg-6 mb-4">
              <h1 className="mb-3">Aprenda de forma intuitiva</h1>

              <div className="card card-objectives mb-3">
                <div className="d-flex align-items-center">
                  <span className="p-3">
                    <FileBadge
                      size={40}
                      color="#39639C"
                      className="card-icon"
                    />
                  </span>
                  <div className="card-body">
                    <h5 className="card-title">Certificação</h5>
                    <p className="card-text">
                      Aprenda com foco nos seus objetivos e receba um
                      certificado ao concluir o curso.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card card-objectives mb-3">
                <div className="d-flex align-items-center">
                  <span className="p-3">
                    <MessagesSquare
                      size={40}
                      color="#39639C"
                      className="card-icon"
                    />
                  </span>
                  <div className="card-body">
                    <h5 className="card-title">Partilha de conhecimento</h5>
                    <p className="card-text">
                      Conecta-te com outros utilizadores, partilha ideias e
                      aprende colaborativamente com a comunidade.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card card-objectives mb-3">
                <div className="d-flex align-items-center">
                  <span className="p-3">
                    <BookOpenCheck
                      size={40}
                      color="#39639C"
                      className="card-icon"
                    />
                  </span>
                  <div className="card-body">
                    <h5 className="card-title">Aprendizagem flexível</h5>
                    <p className="card-text">
                      Avança ao teu ritmo com conteúdos organizados para
                      facilitar a tua jornada de aprendizagem.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <h1 className="mb-3">O que os formandos dizem</h1>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Nome do Formando</h5>
                      <p className="card-text">
                        "O curso foi muito bom, aprendi bastante e o professor
                        era muito bom!"
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Nome do Formando2</h5>
                      <p className="card-text">
                        "O curso foi muito bom, aprendi bastante e o professor
                        era muito bom!"
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Nome do Formando3</h5>
                      <p className="card-text">
                        "O curso foi muito bom, aprendi bastante e o professor
                        era muito bom!"
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Nome do Formando4</h5>
                      <p className="card-text">
                        "O curso foi muito bom, aprendi bastante e o professor
                        era muito bom!"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-5 pt-5 pb-4">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
              <h5 className="mb-3">PINT SoftSkills</h5>
              <p className="text-muted">
                Plataforma de aprendizagem online para desenvolvimento de
                competências transversais.
              </p>
              <div className="d-flex gap-3 mt-3">
                <a href="#" className="text-decoration-none text-secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-decoration-none text-secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="text-decoration-none text-secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-decoration-none text-secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
              <h5 className="mb-3">Recursos</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-secondary">
                    Cursos
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-secondary">
                    Tutoriais
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-secondary">
                    Webinars
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-secondary">
                    Comunidade
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
              <h5 className="mb-3">Empresa</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-secondary">
                    Sobre nós
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-secondary">
                    Contacto
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-secondary">
                    Carreiras
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-secondary">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
              <h5 className="mb-3">Subscreva a nossa newsletter</h5>
              <div className="input-group mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="O seu email"
                  aria-label="Email"
                />
                <button className="btn btn-primary" type="button">
                  Subscrever
                </button>
              </div>
              <p className="text-muted small">
                Receba as últimas novidades e conteúdos exclusivos.
              </p>
            </div>
          </div>

          <div className="row mt-4 pt-3 border-top">
            <div className="col-md-6 text-center text-md-start">
              <p className="text-muted small mb-0">
                © 2023 PINT SoftSkills. Todos os direitos reservados.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <a
                href="#"
                className="text-decoration-none text-secondary small me-3"
              >
                Termos de Serviço
              </a>
              <a href="#" className="text-decoration-none text-secondary small">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default WelcomePage;
