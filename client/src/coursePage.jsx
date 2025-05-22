import { React, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import { Star, User, Check } from "lucide-react";
import "./styles/coursePage.css";
import axios from "axios";
import Loader from "./components/loader.jsx";
import SuccessMessage from "./components/sucess_message.jsx";
import ErrorMessage from "./components/error_message.jsx";
import useAuthStore from "./store/authStore.js";

//TODO: Buscar os dados do curso na API e preencher os dados do curso

function CoursePage() {
  const { user } = useAuthStore();
  const [index, setIndex] = useState(0); // 0 - Info, 1 - Módulos, 2 - Reviews
  const [course, setCourse] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0);
  const { courseId } = useParams();
  const [inscrito, setInscrito] = useState(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [showMessage, setShowMessage] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleIndexChange = (newIndex) => {
    setIndex(newIndex);
  };

  const handleInscrito = () => {
    if (!user) {
      setError(true);
      setMessage("Por favor faça login para se inscrever no curso.");
      return;
    }

    if (inscrito) {
      navigate(
        `/dashboard/courses/${courseId}/modules/${course.MODULOS[0].ID_MODULO}`
      );
    } else {
      inscreverCurso(courseId);
    }
  };

  const convertMinutesToHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  useEffect(() => {
    const getCourseData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:4000/api/cursos/" + courseId
        );
        const data = response.data;
        console.log(data);
        setCourse(data);
        setTotalTime(
          data.MODULOS.reduce((total, modulo) => {
            return total + modulo.TEMPO_ESTIMADO_MIN;
          }, 0)
        );
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };

    getCourseData();
  }, [courseId]);

  useEffect(() => {
    const verificarInscricao = async () => {
      if (!user) {
        setInscrito(false);
        return;
      }

      try {
        const response = await axios.post(
          `http://localhost:4000/api/user/verify-course/${courseId}`,
          {
            courseType: course.CURSO_SINCRONO ? "sincrono" : "assincrono",
          },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.inscrito === true) {
          console.log("User está inscrito no curso");
          setInscrito(true);
        } else {
          console.log("Erro ao verificar inscrição:", response.data.message);
          setInscrito(false);
        }
      } catch (error) {
        console.error(
          "Erro ao verificar inscrição:",
          error.response?.data?.message || error.message
        );
      }
    };

    verificarInscricao();
  }, [courseId, user]);

  const inscreverCurso = async (cursoId) => {
    try {
      setIsEnrolling(true);
      const response = await axios.post(
        `http://localhost:4000/api/user/enter-course/${cursoId}`,
        {
          courseType: course.CURSO_SINCRONO ? "sincrono" : "assincrono",
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        setMessage(`Inscrito com sucesso no curso ${course.NOME}`);
        setShowMessage(true);
        // Redirecionar ou atualizar a interface
      }
    } catch (error) {
      console.error(
        "Erro ao inscrever:",
        error.response?.data?.message || error.message
      );
      alert(error.response?.data?.message || "Erro ao realizar inscrição");
      setMessage(error.response?.data?.message || "Erro ao realizar inscrição");
      setError(true);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Navbar />
          {showMessage && (
            <SuccessMessage
              message={message}
              onClose={() => setShowMessage(false)}
            />
          )}
          {error && (
            <div
              className="position-fixed top-0 start-0 w-100 d-flex justify-content-center align-items-center"
              style={{ zIndex: 1050, paddingTop: "20px" }}
            >
              <ErrorMessage message={message} onClose={() => setError(false)} />
            </div>
          )}
          <div className="container-fluid banner-curso">
            <div className="container d-flex flex-column justify-content-start">
              <div className="container d-flex justify-content-start mt-3">
                <nav aria-label="breadcrumb mt-2">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <a
                        href="#"
                        className="text-decoration-none"
                        style={{ color: "#39639C", fontWeight: "500" }}
                      >
                        {course.AREA.Categoria.NOME__}
                      </a>
                    </li>
                    <li className="breadcrumb-item">
                      <a
                        href="#"
                        className="text-decoration-none"
                        style={{ color: "#39639C", fontWeight: "500" }}
                      >
                        {course.AREA.NOME}
                      </a>
                    </li>
                    <li className="breadcrumb-item" aria-current="page">
                      <a
                        href="#"
                        className="text-decoration-none"
                        style={{ color: "#39639C", fontWeight: "500" }}
                      >
                        {course.Topico?.TITULO}
                      </a>
                    </li>
                  </ol>
                </nav>
              </div>

              <div className="container d-flex flex-row justify-content-start gap-1 p-0">
                <div className="container d-flex flex-column justify-content-start mt-4">
                  <h1>{course.NOME}</h1>
                  <p
                    className="mt-2"
                    style={{ height: "158px", maxWidth: "700px" }}
                  >
                    {course.DESCRICAO_OBJETIVOS__}
                  </p>
                  <div className="d-flex flex-row justify-content-between">
                    <h1 className="course-text-h1">
                      {course.CURSO_SINCRONO
                        ? `Lecionado por: ${course.CURSO_SINCRONO.UTILIZADOR.USERNAME}`
                        : `Curso assíncrono`}
                    </h1>
                    <h1 className="course-text-h1">
                      {course.CURSO_SINCRONO
                        ? `${course.CURSO_SINCRONO.VAGAS} vagas restantes`
                        : ``}
                    </h1>
                  </div>
                  <div className="d-flex justify-content-start mt-3">
                    <button
                      className="btn btn-primary fs-5 ps-5 pe-5"
                      onClick={() => handleInscrito()}
                      disabled={
                        (course.CURSO_SINCRONO &&
                          course.CURSO_SINCRONO.VAGAS <= 0) ||
                        isEnrolling
                      }
                    >
                      {isEnrolling ? (
                        <span>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          A guardar o lugar...
                        </span>
                      ) : inscrito ? (
                        "Ir para o curso"
                      ) : (
                        "Inscrever"
                      )}
                    </button>
                  </div>
                </div>

                <div className="d-flex align-itens-center justify-content-center p-3">
                  <img
                    src={course.IMAGEM?.replace(
                      "upload/",
                      "upload/w_530,h_300,c_fill/f_auto/q_auto/"
                    )}
                    alt={`Imagem do curso ${course.NOME}`}
                    className="rounded course-image"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="container d-flex flex-row justify-content-around p-3 shadow border course-info-banner">
            <div
              className="container d-flex flex-column align-items-center justify-content-center"
              style={{ height: "90px" }}
            >
              <h1 className="fs-4 m-0">{course.MODULOS.length} Módulos</h1>
            </div>
            <div className="container d-flex flex-column align-items-center justify-content-center border-start">
              <h1 className="fs-5 m-0">Aprenda ao seu ritmo</h1>
              <p className="m-0 fs-6">
                {convertMinutesToHours(totalTime)} no total
              </p>
            </div>
            <div className="container d-flex flex-column justify-content-center align-items-center border-start">
              <div className="d-flex align-items-center flex-column">
                <div className="d-flex flex-row justify-content-center align-items-center">
                  <h1 className="mb-0 fs-4">4.3</h1>
                  <Star fill="#39639C" strokeWidth={0} />
                </div>
                <div className="d-flex align-items-center justify-content-center">
                  <p className="m-0 fs-6 text-center">X reviews</p>
                </div>
              </div>
            </div>
            <div className="container d-flex flex-column align-items-center justify-content-center border-start">
              <h1 className="fs-4 m-0">{course.DIFICULDADE_CURSO__}</h1>
              <div className="d-flex align-items-center justify-content-center">
                <p className="m-0 fs-6">Nível de dificuldade</p>
              </div>
            </div>
            <div className="container d-flex flex-column align-items-center justify-content-center border-start">
              <h1 className="fs-5 m-0 text-center">Certificado disponível</h1>
              <div className="d-flex align-items-center justify-content-center">
                <p className="m-0 fs-6 text-center">
                  A conclusão deste curso<br></br> garante um certificado
                </p>
              </div>
            </div>
          </div>

          <div className="container d-flex flex-column mt-5 p-0">
            <div className="container justify-content-start d-flex align-items-center">
              <ul className="list-group list-group-horizontal">
                <a
                  onClick={() => handleIndexChange(0)}
                  className={`list-group-item list-group-item-action horizontal-list-item pb-0 rounded-0 course-tab ${
                    index === 0 ? "active" : ""
                  }`}
                >
                  Info
                </a>
                <a
                  onClick={() => handleIndexChange(1)}
                  className={`list-group-item list-group-item-action horizontal-list-item pb-0 course-tab ${
                    index === 1 ? "active" : ""
                  }`}
                >
                  Módulos
                </a>
                <a
                  onClick={() => handleIndexChange(2)}
                  className={`list-group-item list-group-item-action horizontal-list-item pb-0 rounded-0 course-tab ${
                    index === 2 ? "active" : ""
                  }`}
                >
                  Testemunhas
                </a>
              </ul>
            </div>
            <div className="container d-flex align-items-center p-0">
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "#DFE4EA",
                  marginTop: "-2px",
                }}
              ></div>
            </div>
          </div>

          <div className="container d-flex flex-column p-0 mt-2">
            {index === 0 && (
              <>
                <div className="d-flex flex-row">
                  <div className="d-flex flex-column w-50">
                    <h1 className="fs-4 m-0 p-2">O que vai aprender</h1>
                    <div className="d-flex flex-column">
                      <div className="row">
                        {course.OBJETIVOS.map((obj, index) => (
                          <div className="col" key={index}>
                            <div className="d-flex flex-row objectives align-items-center m-3">
                              <Check
                                className="me-2"
                                size={35}
                                strokeWidth={1}
                                color="#373737"
                              />
                              <p className="m-0" style={{ maxWidth: "320px" }}>
                                {obj.DESCRICAO}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex flex-column ps-3 border-start w-50">
                    <h1 className="fs-4 m-0 p-2">
                      Habilidades que desenvolverá
                    </h1>
                    <div className="d-flex flex-column p-2">
                      <div className="d-flex gap-4 flex-wrap">
                        {course.HABILIDADES.map((habilidade, index) => (
                          <div
                            key={index}
                            style={{
                              backgroundColor: "#D6DEE880",
                              borderRadius: "5px",
                              padding: "6px 12px",
                              margin: "4px",
                              display: "inline-block",
                            }}
                          >
                            <span className="m-0" style={{ fontSize: "1rem" }}>
                              {habilidade.DESCRICAO}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {index === 1 && (
              <>
                <div className="d-flex flex-row">
                  <div className="d-flex flex-column w-100">
                    <h1 className="fs-4 m-0 p-2">Módulos ao longo do curso</h1>
                    <div className="d-flex flex-column mt-3">
                      <div className="row row-cols-1 row-cols-md-2 g-4">
                        {/* Modulos */}
                        {course.MODULOS.map((modulo, index) => (
                          <div className="col" key={index}>
                            <div className="card h-100">
                              <div className="card-body d-flex flex-column">
                                <h5 className="card-title mb-3">
                                  {modulo.NOME}
                                </h5>
                                <p className="card-text flex-grow-1">
                                  {modulo.DESCRICAO}
                                </p>
                                <div className="mt-auto">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                      Duração:{" "}
                                      {convertMinutesToHours(
                                        modulo.TEMPO_ESTIMADO_MIN
                                      )}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {index === 2 && (
              <>
                <div className="d-flex flex-row">
                  <div className="d-flex flex-column">
                    <h1 className="fs-4 m-0 mb-3 p-2">
                      O porquê das pessoas escolherem a SoftSkills
                    </h1>
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                      <div className="col">
                        <div className="card h-100 testimonial-card">
                          <div className="card-body">
                            <p className="card-text">
                              "A plataforma da SoftSkills transformou a minha
                              forma de aprender. Os cursos são interativos e os
                              formadores são excelentes!"
                            </p>
                          </div>
                          <div className="card-footer d-flex justify-content-between align-items-center bg-white">
                            <div className="card-text mb-0 d-flex align-items-center">
                              <User
                                size={20}
                                color="#39639C"
                                className="me-2"
                              />
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
                              "Os cursos são muito bem estruturados e os
                              conteúdos são relevantes. Recomendo a todos que
                              queiram desenvolver novas habilidades!"
                            </p>
                          </div>
                          <div className="card-footer d-flex justify-content-between align-items-center bg-white">
                            <div className="card-text mb-0 d-flex align-items-center">
                              <User
                                size={20}
                                color="#39639C"
                                className="me-2"
                              />
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
                              "A SoftSkills é uma plataforma incrível! Os cursos
                              são muito úteis e os formadores são super
                              atenciosos. Estou a aprender muito"
                            </p>
                          </div>
                          <div className="card-footer d-flex justify-content-between align-items-center bg-white">
                            <div className="card-text mb-0 d-flex align-items-center">
                              <User
                                size={20}
                                color="#39639C"
                                className="me-2"
                              />
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
                              "A plataforma é super intuitiva! Consegui aprender
                              ao meu ritmo e adorei receber o certificado no
                              final. Já comecei outro curso!"
                            </p>
                          </div>
                          <div className="card-footer d-flex justify-content-between align-items-center bg-white">
                            <div className="card-text mb-0 d-flex align-items-center">
                              <User
                                size={20}
                                color="#39639C"
                                className="me-2"
                              />
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
              </>
            )}
          </div>
          <Footer />
        </>
      )}
    </>
  );
}

export default CoursePage;
