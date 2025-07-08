import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "./components/navbar.jsx";
import Loader from "./components/loader.jsx";
import "./styles/welcomepage.css";
import CourseCard from "./components/course_card.jsx";
import { FileBadge } from "lucide-react";
import { BookOpenCheck } from "lucide-react";
import { MessagesSquare } from "lucide-react";
import { User } from "lucide-react";
import { Star } from "lucide-react";
import Footer from "./components/footer.jsx";
import { useNavigate } from "react-router-dom";

const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function WelcomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isloadingCourses, setIsLoadingCourses] = useState(false);
  const [error, setError] = useState(null);
  const [activeFeature, setActiveFeature] = useState("certification");
  const navigate = useNavigate();

  const featureImages = {
    certification: "./images/undraw_certificate.svg",
    knowledge: "./images/undraw_post.svg",
    learning: "./images/undraw_learning.svg",
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const response = await axios.get(`${URL}/api/cursos/popular`);
        const processedCourses = response.data.map((course) => {
          let status = "Indisponível";

          if (course.CURSO_SINCRONO) {
            const now = new Date();
            const startDate = new Date(course.CURSO_SINCRONO.DATA_INICIO);
            const endDate = new Date(course.CURSO_SINCRONO.DATA_FIM);
            if (now < startDate) {
              status = "Brevemente";
            } else if (now > endDate) {
              status = "Terminado";
            } else {
              status = "Em curso";
            }
          } else if (course.CURSO_ASSINCRONO) {
            const now = new Date();
            const startDate = new Date(course.CURSO_ASSINCRONO.DATA_INICIO);
            const endDate = new Date(course.CURSO_ASSINCRONO.DATA_FIM);

            if (now < startDate) {
              status = "Brevemente";
            } else if (now > endDate) {
              status = "Inativo";
            } else {
              status = "Ativo";
            }
          }

          return { ...course, status };
        });
        setCourses(processedCourses);
        setLoading(false);
      } catch (err) {
        console.error("Erro a encontrar os cursos populares:", err);
        setError(err.message);
        setLoading(false);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Navbar />
      <div className="container-fluid banner-container">
        <div className="container d-flex justify-content-center justify-content-md-start banner">
          <div className="p-3 p-md-4 d-flex flex-column justify-content-center ms-0 ms-md-5">
            <div className="d-flex flex-column text-center text-md-start">
              <div className="d-flex flex-column justify-content-start shadow border-2 rounded-3 p-3 p-md-4 message-box">
                <h2 className="h3 h-md-2">Aprenda novas habilidades</h2>
                <p className="mb-3">
                  Estude com mais de 100 cursos disponiveis!
                </p>
                <div className="d-flex justify-content-center justify-content-md-start">
                  <button className="btn btn-primary px-4">Começar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container d-flex flex-column mt-4 mt-md-5 p-3 p-md-0">
        <div className="d-flex flex-column justify-content-start mb-3 text-center text-md-start">
          <h1 className="h2 h-md-1">Os mais populares</h1>
          <p className="mb-2">
            Explore os nossos cursos mais populares e prepare-se para aprender
            novas habilidades
          </p>
        </div>

        <div className="container p-0 mb-3">
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {isloadingCourses ? (
              <div className="col-12 d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              courses.map((course) => (
                <div className="col" key={course.ID_CURSO}>
                  <CourseCard course={course} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="d-flex justify-content-center justify-content-md-start mb-3 mt-3">
          <button
            className="btn btn-primary fs-5 fs-md-5 px-4"
            onClick={() => {
              navigate("/find-courses");
            }}
          >
            Ver todos os cursos
          </button>
        </div>

        <div className="container mt-4 mt-md-5 p-0">
          <div className="row align-items-center">
            <div className="col-12 col-lg-6 mb-4 mb-lg-0 order-2 order-lg-1">
              <h1 className="mb-3 h2 h-md-1 text-center text-lg-start">
                Aprenda de forma intuitiva
              </h1>

              <div
                className={`card card-objectives mb-3 ${
                  activeFeature === "certification" ? "card-active" : ""
                }`}
                onClick={() => setActiveFeature("certification")}
                role="button"
              >
                <div className="d-flex align-items-center">
                  <span className="p-2 p-md-3">
                    <FileBadge
                      size={32}
                      color="#39639C"
                      className="card-icon d-block d-md-none"
                    />
                    <FileBadge
                      size={40}
                      color="#39639C"
                      className="card-icon d-none d-md-block"
                    />
                  </span>
                  <div className="card-body p-2 p-md-3">
                    <h4 className="card-title h4 h-md-5">Certificação</h4>
                    <p className="card-text">
                      Aprenda com foco nos seus objetivos e receba um
                      certificado ao concluir o curso.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`card card-objectives mb-3 ${
                  activeFeature === "knowledge" ? "card-active" : ""
                }`}
                onClick={() => setActiveFeature("knowledge")}
                role="button"
              >
                <div className="d-flex align-items-center">
                  <span className="p-2 p-md-3">
                    <MessagesSquare
                      size={32}
                      color="#39639C"
                      className="card-icon d-block d-md-none"
                    />
                    <MessagesSquare
                      size={40}
                      color="#39639C"
                      className="card-icon d-none d-md-block"
                    />
                  </span>
                  <div className="card-body p-2 p-md-3">
                    <h4 className="card-title h4 h-md-5">
                      Partilha de conhecimento
                    </h4>
                    <p className="card-text ">
                      Conecta-te com outros utilizadores, partilha ideias e
                      aprende colaborativamente com a comunidade.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`card card-objectives mb-3 ${
                  activeFeature === "learning" ? "card-active" : ""
                }`}
                onClick={() => setActiveFeature("learning")}
                role="button"
              >
                <div className="d-flex align-items-center">
                  <span className="p-2 p-md-3">
                    <BookOpenCheck
                      size={32}
                      color="#39639C"
                      className="card-icon d-block d-md-none"
                    />
                    <BookOpenCheck
                      size={40}
                      color="#39639C"
                      className="card-icon d-none d-md-block"
                    />
                  </span>
                  <div className="card-body p-2 p-md-3">
                    <h4 className="card-title h4 h-md-5">
                      Aprendizagem flexível
                    </h4>
                    <p className="card-text ">
                      Avança ao teu ritmo com conteúdos organizados para
                      facilitar a tua jornada de aprendizagem.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-3 order-1 order-lg-2">
              <div className="feature-image-container">
                <img
                  src={featureImages[activeFeature]}
                  className="feature-image img-fluid"
                  alt={`Ilustração de ${
                    activeFeature === "certification"
                      ? "certificação"
                      : activeFeature === "knowledge"
                      ? "partilha de conhecimento"
                      : "aprendizagem flexível"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container p-3 p-md-0 mt-4 mt-md-5">
        <h1 className="mb-3 h2 h-md-1 text-center text-md-start">
          O que os formandos dizem
        </h1>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3">
          <div className="col">
            <div className="card h-100 testimonial-card">
              <div className="card-body p-3">
                <p className="card-text">
                  "A plataforma da SoftSkills transformou a minha forma de
                  aprender. Os cursos são interativos e os formadores são
                  excelentes!"
                </p>
              </div>
              <div className="card-footer d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center bg-white p-3">
                <div className="card-text mb-2 mb-sm-0 d-flex align-items-center">
                  <User size={18} color="#39639C" className="me-2" />
                  <p className="mb-0 ">João Silva</p>
                </div>
                <div className="card-rating d-flex align-items-center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      fill="#FFD700"
                      key={index}
                      size={16}
                      color="#FFD700"
                      className="me-1"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100 testimonial-card">
              <div className="card-body p-3">
                <p className="card-text ">
                  "Os cursos são muito bem estruturados e os conteúdos são
                  relevantes. Recomendo a todos que queiram desenvolver novas
                  habilidades!"
                </p>
              </div>
              <div className="card-footer d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center bg-white p-3">
                <div className="card-text mb-2 mb-sm-0 d-flex align-items-center">
                  <User size={18} color="#39639C" className="me-2" />
                  <p className="mb-0 ">Mariana</p>
                </div>
                <div className="card-rating d-flex align-items-center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      fill="#FFD700"
                      key={index}
                      size={16}
                      color="#FFD700"
                      className="me-1"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100 testimonial-card">
              <div className="card-body p-3">
                <p className="card-text ">
                  "A SoftSkills é uma plataforma incrível! Os cursos são muito
                  úteis e os formadores são super atenciosos. Estou a aprender
                  muito"
                </p>
              </div>
              <div className="card-footer d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center bg-white p-3">
                <div className="card-text mb-2 mb-sm-0 d-flex align-items-center">
                  <User size={18} color="#39639C" className="me-2" />
                  <p className="mb-0 ">Rodrigo Silva</p>
                </div>
                <div className="card-rating d-flex align-items-center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      fill="#FFD700"
                      key={index}
                      size={16}
                      color="#FFD700"
                      className="me-1"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100 testimonial-card">
              <div className="card-body p-3">
                <p className="card-text ">
                  "A plataforma é super intuitiva! Consegui aprender ao meu
                  ritmo e adorei receber o certificado no final. Já comecei
                  outro curso!"
                </p>
              </div>
              <div className="card-footer d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center bg-white p-3">
                <div className="card-text mb-2 mb-sm-0 d-flex align-items-center">
                  <User size={18} color="#39639C" className="me-2" />
                  <p className="mb-0 ">Ana Rita</p>
                </div>
                <div className="card-rating d-flex align-items-center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      fill="#FFD700"
                      key={index}
                      size={16}
                      color="#FFD700"
                      className="me-1"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default WelcomePage;
