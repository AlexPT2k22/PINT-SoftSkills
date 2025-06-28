import { React, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import {
  Star,
  User,
  Check,
  SquareArrowOutUpRight,
  CheckCircle,
} from "lucide-react";
import "./styles/coursePage.css";
import axios from "axios";
import Loader from "./components/loader.jsx";
import SuccessMessage from "./components/sucess_message.jsx";
import ErrorMessage from "./components/error_message.jsx";
import useAuthStore from "./store/authStore.js";
import CourseReviews from "./components/courseReviews.jsx";

function CoursePage() {
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
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
  const [statistics, setStatistics] = useState({
    mediaEstrelas: 0,
    totalReviews: 0,
  });
  const [courseLoaded, setCourseLoaded] = useState(false);
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  const handleIndexChange = (newIndex) => {
    setIndex(newIndex);
  };

  useEffect(() => {
    // Só remove o loading quando TODOS os dados essenciais estiverem carregados
    if (courseLoaded && enrollmentChecked && reviewsLoaded) {
      setLoading(false);
    }
  }, [courseLoaded, enrollmentChecked, reviewsLoaded]);

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
      try {
        const response = await axios.get(`${URL}/api/cursos/` + courseId);
        const data = response.data;
        console.log(data);
        setCourse(data);
        setTotalTime(
          data.MODULOS.reduce((total, modulo) => {
            return total + modulo.TEMPO_ESTIMADO_MIN;
          }, 0)
        );
        setCourseLoaded(true);
      } catch (error) {
        console.error("Error fetching course data:", error);
        setError(true);
        setMessage(
          error.response?.data?.message || "Erro ao carregar os dados do curso"
        );
        setCourseLoaded(false);
      }
    };

    getCourseData();
  }, [courseId]);

  useEffect(() => {
    const verificarInscricao = async () => {
      if (!user) {
        setInscrito(false);
        setEnrollmentChecked(true);
        return;
      }

      try {
        const response = await axios.post(
          `${URL}/api/user/verify-course/${courseId}`,
          {},
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
        setEnrollmentChecked(true);
      } catch (error) {
        console.error(
          "Erro ao verificar inscrição:",
          error.response?.data?.message || error.message
        );
        setInscrito(false);
        setError(true);
        setMessage(
          error.response?.data?.message || "Erro ao verificar inscrição"
        );
        setEnrollmentChecked(true);
      }
    };

    if (courseLoaded) {
      verificarInscricao();
    }
  }, [courseId, user, courseLoaded]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${URL}/api/reviews/${courseId}`);

        if (response.data.success) {
          setStatistics({
            mediaEstrelas: response.data.estatisticas.mediaEstrelas,
            totalReviews: response.data.estatisticas.totalReviews,
          });
        }
        //console.log(statistics);
        setReviewsLoaded(true);
      } catch (error) {
        console.error("Erro ao procurar as reviews:", error);
        setError(true);
        setMessage(
          error.response?.data?.message || "Erro ao carregar as reviews"
        );
        setReviewsLoaded(true);
      }
    };
    fetchReviews();
  }, [courseId]);

  const checkEnrollmentDeadline = (enrollmentDeadline) => {
    if (!enrollmentDeadline) return true; // Se não tiver deadline, pode inscrever

    const today = new Date();
    const deadline = new Date(enrollmentDeadline);

    return today <= deadline;
  };

  const formatEnrollmentDeadline = (enrollmentDeadline) => {
    if (!enrollmentDeadline) return null;

    return new Date(enrollmentDeadline).toLocaleDateString("pt-PT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const inscreverCurso = async (cursoId) => {
    try {
      setIsEnrolling(true);
      const response = await axios.post(
        `${URL}/api/user/enter-course/${cursoId}`,
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
        setInscrito(true);
      }
    } catch (error) {
      console.error(
        "Erro ao inscrever:",
        error.response?.data?.message || error.message
      );
      setMessage(error.response?.data?.message || "Erro ao realizar inscrição");
      setError(true);
    } finally {
      setIsEnrolling(false);
    }
  };

  const isButtonDisabled = () => {
    if (isEnrolling) return true;

    // Se está inscrito
    if (inscrito) {
      // Para cursos síncronos inscritos, só desabilitar se ainda não começou
      if (course.CURSO_SINCRONO) {
        const status = checkDates(
          course.CURSO_SINCRONO.DATA_INICIO,
          course.CURSO_SINCRONO.DATA_FIM
        );
        return status === "O curso ainda não começou";
      }

      // Para cursos assíncronos inscritos
      if (course.CURSO_ASSINCRONO) {
        const status = checkDates(
          course.CURSO_ASSINCRONO.DATA_INICIO,
          course.CURSO_ASSINCRONO.DATA_FIM
        );
        // Desabilitar se o curso assíncrono já terminou
        return status === "O curso já terminou";
      }

      return false;
    }

    // Se NÃO está inscrito
    // Para cursos síncronos
    if (course.CURSO_SINCRONO) {
      // Verificar se há vagas
      if (course.CURSO_SINCRONO.VAGAS <= 0) {
        return true;
      }

      // Verificar prazo de inscrição
      if (course.CURSO_SINCRONO.DATA_LIMITE_INSCRICAO_S) {
        if (
          !checkEnrollmentDeadline(
            course.CURSO_SINCRONO.DATA_LIMITE_INSCRICAO_S
          )
        ) {
          return true;
        }
      }

      // Verificar status do curso síncrono
      const status = checkDates(
        course.CURSO_SINCRONO.DATA_INICIO,
        course.CURSO_SINCRONO.DATA_FIM
      );

      // Para cursos síncronos: não pode inscrever se já terminou ou está em andamento
      return (
        status === "O curso já terminou" ||
        status === "O curso está em andamento"
      );
    }

    // Para cursos assíncronos
    if (course.CURSO_ASSINCRONO) {
      // Verificar se o curso assíncrono já terminou
      const status = checkDates(
        course.CURSO_ASSINCRONO.DATA_INICIO,
        course.CURSO_ASSINCRONO.DATA_FIM
      );

      // Para cursos assíncronos: só não pode inscrever se já terminou
      // PODE inscrever mesmo estando "em andamento"
      return status === "O curso já terminou";
    }

    return false;
  };

  //Função para determinar o texto do botão
  const getButtonText = () => {
    if (isEnrolling) {
      return (
        <span>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          A guardar o lugar...
        </span>
      );
    }

    if (inscrito) {
      if (course.CURSO_SINCRONO) {
        const status = checkDates(
          course.CURSO_SINCRONO.DATA_INICIO,
          course.CURSO_SINCRONO.DATA_FIM
        );

        switch (status) {
          case "O curso ainda não começou":
            return "Aguardando início do curso";
          case "O curso está em andamento":
          case "Inscrever":
            return "Ir para o curso";
          case "O curso já terminou":
            return "Curso terminado";
          default:
            return "Ir para o curso";
        }
      }

      // Para cursos assíncronos inscritos
      if (course.CURSO_ASSINCRONO) {
        const status = checkDates(
          course.CURSO_ASSINCRONO.DATA_INICIO,
          course.CURSO_ASSINCRONO.DATA_FIM
        );

        if (status === "O curso já terminou") {
          return "Curso terminado";
        }

        return "Ir para o curso";
      }

      return "Ir para o curso";
    }

    // Para não inscritos
    if (course.CURSO_SINCRONO) {
      // Verificar vagas primeiro
      if (course.CURSO_SINCRONO.VAGAS <= 0) {
        return "Sem vagas";
      }

      // Verificar prazo de inscrição
      if (course.CURSO_SINCRONO.DATA_LIMITE_INSCRICAO_S) {
        if (
          !checkEnrollmentDeadline(
            course.CURSO_SINCRONO.DATA_LIMITE_INSCRICAO_S
          )
        ) {
          return "Prazo de inscrição expirado";
        }
      }

      // Status do curso síncrono
      return checkDates(
        course.CURSO_SINCRONO.DATA_INICIO,
        course.CURSO_SINCRONO.DATA_FIM,
        course.CURSO_SINCRONO.DATA_LIMITE_INSCRICAO_S
      );
    }

    // Para cursos assíncronos não inscritos
    if (course.CURSO_ASSINCRONO) {
      const status = checkDates(
        course.CURSO_ASSINCRONO.DATA_INICIO,
        course.CURSO_ASSINCRONO.DATA_FIM
      );

      if (status === "O curso já terminou") {
        return "Curso terminado";
      }

      // Para assíncronos, sempre mostrar "Inscrever" se não terminou
      return "Inscrever";
    }

    return "Inscrever";
  };

  const checkDates = (startDate, endDate, enrollmentDeadline = null) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Verificar prazo de inscrição primeiro (apenas para síncronos)
    if (enrollmentDeadline && !checkEnrollmentDeadline(enrollmentDeadline)) {
      return "Prazo de inscrição expirado";
    }

    if (today < start && !inscrito) {
      return "Inscrever";
    } else if (today < start && inscrito) {
      return "O curso ainda não começou";
    } else if (today > end) {
      return "O curso já terminou";
    } else {
      return "O curso está em andamento";
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
                        href={
                          "/find-courses?category=" +
                          course.AREA.Categoria.ID_CATEGORIA__PK___
                        }
                        className="text-decoration-none"
                        style={{ color: "#39639C", fontWeight: "500" }}
                      >
                        {course.AREA.Categoria.NOME__}
                      </a>
                    </li>
                    <li className="breadcrumb-item">
                      <a
                        href={
                          "/find-courses?category=" +
                          course.AREA.Categoria.ID_CATEGORIA__PK___ +
                          "&area=" +
                          course.AREA.ID_AREA
                        }
                        className="text-decoration-none"
                        style={{ color: "#39639C", fontWeight: "500" }}
                      >
                        {course.AREA.NOME}
                      </a>
                    </li>
                    <li className="breadcrumb-item" aria-current="page">
                      <a
                        href={
                          "/find-courses?category=" +
                          course.AREA.Categoria.ID_CATEGORIA__PK___ +
                          "&area=" +
                          course.AREA.ID_AREA +
                          "&topic=" +
                          course.Topico.ID_TOPICO
                        }
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
                      {course.CURSO_SINCRONO ? (
                        <>
                          Lecionado por:{" "}
                          <a
                            href={`/user/${course?.CURSO_SINCRONO?.UTILIZADOR?.ID_UTILIZADOR}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                            style={{ color: "#39639c" }}
                          >
                            {course?.CURSO_SINCRONO?.UTILIZADOR?.NOME ||
                              course?.CURSO_SINCRONO?.UTILIZADOR?.USERNAME ||
                              "Sem formador"}{" "}
                            {(course?.CURSO_SINCRONO?.UTILIZADOR?.NOME ||
                              course?.CURSO_SINCRONO?.UTILIZADOR?.USERNAME) && (
                              <SquareArrowOutUpRight
                                color="#39639C"
                                size={14}
                                className="ms-0"
                              />
                            )}
                          </a>
                        </>
                      ) : (
                        `Curso assíncrono`
                      )}
                    </h1>
                    <h1 className="course-text-h1">
                      {course.CURSO_SINCRONO
                        ? `${course.CURSO_SINCRONO.VAGAS} vagas restantes`
                        : ``}
                    </h1>
                  </div>
                  <div className="d-flex flex-row justify-content-between">
                    <h1 className="course-text-h1 mb-0">
                      {course.CURSO_SINCRONO
                        ? `Datas: ${new Date(
                            course.CURSO_SINCRONO.DATA_INICIO
                          ).toLocaleDateString("pt-PT", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })} a ${new Date(
                            course.CURSO_SINCRONO.DATA_FIM
                          ).toLocaleDateString("pt-PT", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}`
                        : ``}
                    </h1>

                    {course.CURSO_SINCRONO?.DATA_LIMITE_INSCRICAO_S && (
                      <h1 className="course-text-h1 mb-0">
                        Inscrição até:{" "}
                        {formatEnrollmentDeadline(
                          course.CURSO_SINCRONO.DATA_LIMITE_INSCRICAO_S
                        )}
                      </h1>
                    )}
                  </div>
                  <div className="d-flex justify-content-start mt-2">
                    <button
                      className="btn btn-primary fs-5 ps-5 pe-5"
                      onClick={() => handleInscrito()}
                      disabled={isButtonDisabled()}
                    >
                      {getButtonText()}
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
                  <h1 className="mb-0 fs-4">{statistics.mediaEstrelas}</h1>
                  <Star fill="#FFD700" strokeWidth={0} />
                </div>
                <div className="d-flex align-items-center justify-content-center">
                  <p className="m-0 fs-6 text-center">
                    {statistics.totalReviews} avaliações
                  </p>
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

          <div className="container d-flex flex-column mt-1 p-0">
            {course.HAS_QUIZ && (
              <div className="card mt-4">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h5 className="card-title">
                        <CheckCircle size={20} className="text-success me-2" />
                        Quiz Disponível
                      </h5>
                      <p className="card-text">
                        Este curso inclui um quiz para avaliar os seus
                        conhecimentos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="container d-flex flex-column mt-3 p-0">
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
                  Avaliações
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
                <CourseReviews courseId={courseId} isEnrolled={inscrito} />
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
