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

  // ✅ useEffect único para carregar todos os dados
  useEffect(() => {
    let isMounted = true; // Flag para evitar state updates em componentes desmontados

    const loadAllData = async () => {
      try {
        setLoading(true);
        const courseResponse = await axios.get(`${URL}/api/cursos/${courseId}`);

        if (!isMounted) return;

        const courseData = courseResponse.data;
        setCourse(courseData);

        // Calcular tempo total com verificação de segurança
        if (courseData.MODULOS && Array.isArray(courseData.MODULOS)) {
          const total = courseData.MODULOS.reduce((sum, modulo) => {
            return sum + (modulo.TEMPO_ESTIMADO_MIN || 0);
          }, 0);
          setTotalTime(total);
        }

        if (user) {
          try {
            const enrollmentResponse = await axios.post(
              `${URL}/api/user/verify-course/${courseId}`,
              {},
              {
                withCredentials: true,
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (!isMounted) return;
            setInscrito(enrollmentResponse.data.inscrito === true);
          } catch (enrollmentError) {
            if (!isMounted) return;

            // Se for erro de rede ou timeout, não mostrar erro
            if (
              enrollmentError.code === "ECONNABORTED" ||
              enrollmentError.name === "AbortError"
            ) {
              console.log("Timeout na verificação da inscrição");
            } else {
              console.error("Erro ao verificar inscrição:", enrollmentError);
            }

            setInscrito(false);
          }
        } else {
          setInscrito(false);
        }

        try {
          const reviewsResponse = await axios.get(
            `${URL}/api/reviews/${courseId}`,
            {
              timeout: 5000,
            }
          );

          if (!isMounted) return;

          if (reviewsResponse.data.success) {
            setStatistics({
              mediaEstrelas:
                reviewsResponse.data.estatisticas.mediaEstrelas || 0,
              totalReviews: reviewsResponse.data.estatisticas.totalReviews || 0,
            });
          } else {
            setStatistics({ mediaEstrelas: 0, totalReviews: 0 });
          }
        } catch (reviewsError) {
          if (!isMounted) return;
          setStatistics({ mediaEstrelas: 0, totalReviews: 0 });
        }
      } catch (error) {
        if (!isMounted) return;
        setError(true);
        setMessage(
          error.response?.data?.message ||
            error.message ||
            "Erro ao carregar dados do curso"
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (courseId) {
      loadAllData();
    }

    return () => {
      isMounted = false;
    };
  }, [courseId, user?.ID_UTILIZADOR, URL]);

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
            return "A aguardar o início do curso";
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

          {/* Banner do Curso - Responsivo */}
          <div className="container-fluid banner-curso pb-4 pb-md-5 pt-3">
            <div className="container">
              {/* Breadcrumb */}
              <div className="row mb-3">
                <div className="col-12">
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb mb-0">
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
              </div>

              {/* Conteúdo Principal */}
              <div className="row">
                {/* Informações do Curso */}
                <div className="col-lg-7 col-md-12 order-md-1 order-1 mb-4 mb-lg-0">
                  <h1 className="mb-3">{course.NOME}</h1>
                  <p className="mb-4" style={{ maxWidth: "700px" }}>
                    {course.DESCRICAO_OBJETIVOS__}
                  </p>

                  <div className="container-info">
                    {/* Informações do formador e vagas */}
                    <div className="row mb-2">
                      <div className="col-lg-8 col-md-6 col-12 mb-2 mb-md-0">
                        <h6 className="course-text-h1">
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
                                  course?.CURSO_SINCRONO?.UTILIZADOR
                                    ?.USERNAME ||
                                  "Sem formador"}{" "}
                                {(course?.CURSO_SINCRONO?.UTILIZADOR?.NOME ||
                                  course?.CURSO_SINCRONO?.UTILIZADOR
                                    ?.USERNAME) && (
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
                        </h6>
                      </div>
                      <div className="col-lg-4 col-md-6 col-12">
                        {course.CURSO_SINCRONO && (
                          <h6 className="course-text-h1 mb-0 text-end">
                            {course.CURSO_SINCRONO.VAGAS} vagas restantes
                          </h6>
                        )}
                      </div>
                    </div>

                    {/* Datas do curso */}
                    <div className="row mb-3">
                      <div className="col-lg-8 col-md-6 col-12 mb-2 mb-md-0">
                        <h6 className="course-text-h1 mb-0">
                          {course?.CURSO_SINCRONO &&
                            `Datas: ${new Date(
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
                            })}`}

                          {course?.CURSO_ASSINCRONO &&
                            `Datas: ${new Date(
                              course.CURSO_ASSINCRONO.DATA_INICIO
                            ).toLocaleDateString("pt-PT", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })} a ${new Date(
                              course.CURSO_ASSINCRONO.DATA_FIM
                            ).toLocaleDateString("pt-PT", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })}`}
                        </h6>
                      </div>
                      <div className="col-lg-4 col-md-6 col-12">
                        {course.CURSO_SINCRONO?.DATA_LIMITE_INSCRICAO_S && (
                          <h6 className="course-text-h1 mb-0 text-end">
                            Inscrição até:{" "}
                            {formatEnrollmentDeadline(
                              course.CURSO_SINCRONO.DATA_LIMITE_INSCRICAO_S
                            )}
                          </h6>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botão de Inscrição */}
                  <div className="d-flex justify-content-start mt-3">
                    <button
                      className="btn btn-primary px-4 py-2"
                      onClick={() => handleInscrito()}
                      disabled={isButtonDisabled()}
                    >
                      {getButtonText()}
                    </button>
                  </div>
                </div>

                {/* Imagem do Curso */}
                <div className="col-lg-5 col-md-12 order-md-2 order-2">
                  <div className="text-center">
                    <img
                      src={course.IMAGEM?.replace(
                        "upload/",
                        "upload/w_530,h_300,c_fill/f_auto/q_auto/"
                      )}
                      alt={`Imagem do curso ${course.NOME}`}
                      className="img-fluid rounded"
                      style={{
                        maxHeight: "300px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cards de Informação - Responsivo */}
          <div className="container">
            <div className="row shadow border course-info-banner mx-0 p-3">
              <div className="col-lg col-md-6 col-12 py-3 d-flex flex-column justify-content-center align-items-center border-end-lg">
                <h5 className="fs-5 m-0 text-center">
                  {course.MODULOS.length} Módulos
                </h5>
              </div>
              <div className="col-lg col-md-6 col-12 py-3 d-flex flex-column justify-content-center align-items-center border-end-lg">
                <h5 className="fs-6 m-0 text-center">Aprenda ao seu ritmo</h5>
                <p className="m-0 fs-6 text-center">
                  {convertMinutesToHours(totalTime)} no total
                </p>
              </div>
              <div className="col-lg col-md-6 col-12 py-3 d-flex flex-column justify-content-center align-items-center border-end-lg">
                <div className="d-flex align-items-center">
                  <h5 className="mb-0 fs-5 me-1 text-center">
                    {statistics.mediaEstrelas}
                  </h5>
                  <Star fill="#FFD700" strokeWidth={0} size={20} />
                </div>
                <p className="m-0 fs-6 text-center">
                  {statistics.totalReviews} avaliações
                </p>
              </div>
              <div className="col-lg col-md-6 col-12 py-3 d-flex flex-column justify-content-center align-items-center border-end-lg">
                <h5 className="fs-5 m-0 text-center">
                  {course.DIFICULDADE_CURSO__}
                </h5>
                <p className="m-0 fs-6 text-center">Nível de dificuldade</p>
              </div>
              <div className="col-lg col-md-12 col-12 py-3 d-flex flex-column justify-content-center align-items-center">
                <h5 className="fs-6 m-0 text-center">Certificado disponível</h5>
                <p className="m-0 fs-6 text-center">
                  A conclusão deste curso garante um certificado
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Card - Responsivo */}
          <div className="container mt-4">
            {course.HAS_QUIZ && (
              <div className="card">
                <div className="card-body p-3 p-md-4">
                  <div className="row align-items-center">
                    <div className="col-12">
                      <h5 className="card-title d-flex align-items-center">
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

          {/* Navegação em Tabs - Responsivo */}
          <div className="container mt-4">
            <nav className="nav nav-tabs">
              <a
                onClick={() => handleIndexChange(0)}
                className={`nav-link course-tab ${index === 0 ? "active" : ""}`}
              >
                Info
              </a>
              <a
                onClick={() => handleIndexChange(1)}
                className={`nav-link course-tab ${index === 1 ? "active" : ""}`}
              >
                Módulos
              </a>
              <a
                onClick={() => handleIndexChange(2)}
                className={`nav-link course-tab ${index === 2 ? "active" : ""}`}
              >
                Avaliações
              </a>
            </nav>
            <hr className="mt-0" />
          </div>

          {/* Conteúdo das Tabs - Responsivo */}
          <div className="container my-4">
            {/* Tab Info */}
            {index === 0 && (
              <div className="row">
                {/* O que vai aprender */}
                <div className="col-lg-6 col-md-12 mb-4 mb-lg-0">
                  <h4 className="mb-3">O que vai aprender</h4>
                  <div className="row">
                    {course.OBJETIVOS.map((obj, index) => (
                      <div className="col-12 mb-3" key={index}>
                        <div className="d-flex align-items-start">
                          <Check
                            className="me-3 mt-1 flex-shrink-0"
                            size={24}
                            strokeWidth={1}
                            color="#373737"
                          />
                          <p className="m-0">{obj.DESCRICAO}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Habilidades */}
                <div className="col-lg-6 col-md-12">
                  <h4 className="mb-3">Habilidades que desenvolverá</h4>
                  <div className="d-flex flex-wrap gap-2">
                    {course.HABILIDADES.map((habilidade, index) => (
                      <span
                        key={index}
                        className="badge rounded-pill"
                        style={{
                          backgroundColor: "#D6DEE880",
                          color: "#333",
                          fontSize: "0.9rem",
                          padding: "8px 12px",
                        }}
                      >
                        {habilidade.DESCRICAO}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab Módulos */}
            {index === 1 && (
              <>
                <h4 className="mb-4">Módulos ao longo do curso</h4>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                  {course.MODULOS.map((modulo, index) => (
                    <div className="col" key={index}>
                      <div className="card h-100 shadow-sm">
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title mb-3">{modulo.NOME}</h5>
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
              </>
            )}

            {/* Tab Avaliações */}
            {index === 2 && (
              <CourseReviews courseId={courseId} isEnrolled={inscrito} />
            )}
          </div>
          <Footer />
        </>
      )}
    </>
  );
}

export default CoursePage;
