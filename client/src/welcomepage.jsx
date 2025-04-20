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
import { User } from "lucide-react";
import { Star } from "lucide-react";
import Footer from "./components/footer.jsx";

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
        <div className="container d-flex justify</p>-content-start banner">
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

        <div className="container mt-3 p-0">
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
          </div>
        </div>

        <div className="container p-0 mb-3">
          <h1 className="mb-3">O que os formandos dizem</h1>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            <div className="col">
              <div className="card h-100 testimonial-card">
                <div className="card-body">
                  <p className="card-text">
                    "A plataforma da SoftSkills transformou a minha forma de
                    aprender. Os cursos são interativos e os formadores são
                    excelentes!"
                  </p>
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center bg-white">
                  <div className="card-text mb-0 d-flex align-items-center">
                    <User size={20} color="#39639C" className="me-2" />
                    <p className="mb-0">João Silva</p>
                  </div>
                  <div className="card-rating d-flex align-items-center">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        fill="#FFD700"
                        key={index}
                        size={18}
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
                <div className="card-body">
                  <p className="card-text">
                    "Os cursos são muito bem estruturados e os conteúdos são
                    relevantes. Recomendo a todos que queiram desenvolver novas
                    habilidades!"
                  </p>
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center bg-white">
                  <div className="card-text mb-0 d-flex align-items-center">
                    <User size={20} color="#39639C" className="me-2" />
                    <p className="mb-0">Mariana</p>
                  </div>
                  <div className="card-rating d-flex align-items-center">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        fill="#FFD700"
                        key={index}
                        size={18}
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
                <div className="card-body">
                  <p className="card-text">
                    "A SoftSkills é uma plataforma incrível! Os cursos são muito
                    úteis e os formadores são super atenciosos. Estou a aprender
                    muito"
                  </p>
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center bg-white">
                  <div className="card-text mb-0 d-flex align-items-center">
                    <User size={20} color="#39639C" className="me-2" />
                    <p className="mb-0">Rodrigo Silva</p>
                  </div>
                  <div className="card-rating d-flex align-items-center">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        fill="#FFD700"
                        key={index}
                        size={18}
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
                <div className="card-body">
                  <p className="card-text">
                    "A plataforma é super intuitiva! Consegui aprender ao meu
                    ritmo e adorei receber o certificado no final. Já comecei
                    outro curso!"
                  </p>
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center bg-white">
                  <div className="card-text mb-0 d-flex align-items-center">
                    <User size={20} color="#39639C" className="me-2" />
                    <p className="mb-0">Ana Rita</p>
                  </div>
                  <div className="card-rating d-flex align-items-center">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        fill="#FFD700"
                        key={index}
                        size={18}
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
      </div>

      <Footer />
    </>
  );
}

export default WelcomePage;
