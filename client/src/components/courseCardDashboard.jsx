import React, { useState, useEffect } from "react";
import "../styles/course_card.css";
import { useNavigate } from "react-router-dom";
import { Pen, Eye, Download, GraduationCap } from "lucide-react";
import useAuthStore from "../store/authStore";
import axios from "axios";

function CourseCardDashboard({
  course,
  progress = null,
  showButtons = false,
  showProgress = true,
  showStartButton = true,
}) {
  const { NOME, CURSO_ASSINCRONO, CURSO_SINCRONO, IMAGEM } = course;
  const navigate = useNavigate();

  // Estados para controlar quiz
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loadingQuizStatus, setLoadingQuizStatus] = useState(true);

  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Verificar status do quiz ao carregar o componente
  useEffect(() => {
    checkQuizStatus();
  }, [course.ID_CURSO]);

  const checkQuizStatus = async () => {
    try {
      setLoadingQuizStatus(true);

      // Verificar se o curso tem quiz
      const quizResponse = await axios.get(
        `${URL}/api/quiz/curso/${course.ID_CURSO}`,
        { withCredentials: true }
      );

      if (quizResponse.data.hasQuiz) {
        setHasQuiz(true);

        // Verificar se o usuário já completou o quiz
        try {
          const resultResponse = await axios.get(
            `${URL}/api/quiz/${quizResponse.data.quiz.ID_QUIZ}/resultado`,
            { withCredentials: true }
          );

          if (resultResponse.data.hasResponse) {
            setQuizCompleted(true);
          }
        } catch (resultError) {
          // Usuário ainda não fez o quiz
          if (resultError.response?.status !== 404) {
            console.error("Erro ao verificar resultado do quiz:", resultError);
          }
        }
      }
    } catch (error) {
      // Curso não tem quiz
      if (error.response?.status !== 404) {
        console.error("Erro ao verificar quiz:", error);
      }
    } finally {
      setLoadingQuizStatus(false);
    }
  };

  const handleClick = () => {
    // If user has progress, navigate to the first incomplete module
    if (progress > 0 && progress < 100 && course.moduleProgress) {
      // Find first incomplete module
      const nextModule = course.MODULOS.find(
        (module) => !course.moduleProgress[module.ID_MODULO]
      );

      // If found, navigate to it, otherwise navigate to first module
      if (nextModule) {
        navigate(
          `/dashboard/courses/${course.ID_CURSO}/modules/${nextModule.ID_MODULO}`
        );
      } else {
        navigate(
          `/dashboard/courses/${course.ID_CURSO}/modules/${course.MODULOS[0].ID_MODULO}`
        );
      }
    } else {
      // If no progress, navigate to first module
      navigate(
        `/dashboard/courses/${course.ID_CURSO}/modules/${course.MODULOS[0].ID_MODULO}`
      );
    }
  };

  const handleClickCertificado = async () => {
    try {
      // Get the certificate
      const response = await axios.get(
        `${URL}/api/certificados/gerar/${course.ID_CURSO}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Open certificate URL in a new tab
        window.open(response.data.certificado.url, "_blank");
      } else {
        console.error("Falha ao gerar certificado:", response.data.message);
        alert("Erro ao gerar certificado. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar certificado:", error);

      // Show specific error message if available
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao gerar certificado. Por favor, tente novamente.";
      alert(errorMessage);
    }
  };

  const handleClickQuiz = () => {
    navigate(`/dashboard/courses/${course.ID_CURSO}/quiz`);
  };

  const checkDate = () => {
    const today = new Date();
    const startDate = new Date(CURSO_SINCRONO?.DATA_INICIO);
    const endDate = new Date(CURSO_SINCRONO?.DATA_FIM);
    return today >= startDate && today <= endDate;
  };

  // Get user data from auth store
  const user = useAuthStore((state) => state.user);
  const userType = user?.perfil;

  // Check if user is admin or teacher
  const isGestorOrFormador = userType === 3 || userType === 2;

  const formatDate = (dateString) => {
    const options = { month: "numeric", day: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-PT", options);
  };

  const DATA_INICIO = CURSO_SINCRONO?.DATA_INICIO || "N/A";
  const DATA_FIM = CURSO_SINCRONO?.DATA_FIM || "N/A";

  const tipo = CURSO_ASSINCRONO
    ? "Assíncrono"
    : CURSO_SINCRONO
    ? "Síncrono"
    : "Não especificado";

  // Determinar se deve mostrar o botão do certificado
  const shouldShowCertificateButton = () => {
    // Se o curso está 100% completo
    if (progress === 100) {
      // Se tem quiz, só mostra certificado se quiz foi completado
      if (hasQuiz) {
        return quizCompleted;
      }
      // Se não tem quiz, mostra certificado
      return true;
    }
    return false;
  };

  // Determinar se deve mostrar o botão do quiz
  const shouldShowQuizButton = () => {
    // Só mostra se tem quiz, curso está completo e quiz ainda não foi feito
    return hasQuiz && progress === 100 && !quizCompleted;
  };

  return (
    <div className="card h-100 course-card">
      <img
        src={
          IMAGEM
            ? IMAGEM.replace(
                "upload/",
                "upload/w_530,h_300,c_fill/f_auto/q_auto/"
              )
            : "https://placehold.co/530x300"
        }
        className="card-img-top img-fluid"
        alt={`Imagem do curso ${NOME}`}
      />
      <div className="card-body">
        <div className="card-title d-flex justify-content-between align-items-center mb-1">
          <h5 className="mb-0">{NOME}</h5>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <p className="card-text mb-0">{tipo}</p>
          <p className="card-text mb-0">
            {tipo === "Síncrono"
              ? formatDate(DATA_INICIO) + " - " + formatDate(DATA_FIM)
              : ""}
          </p>
        </div>

        {/* Progress bar visible for all users */}
        {showProgress && (
          <>
            <div className="mt-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small">Progresso</span>
                <span className="text-muted small">{progress}%</span>
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>

            {/* Indicadores de quiz */}
            {!loadingQuizStatus && hasQuiz && (
              <div className="mt-2">
                <div className="d-flex align-items-center">
                  <small className="text-muted">
                    Quiz:{" "}
                    {quizCompleted ? (
                      <span className="text-success">Completo</span>
                    ) : progress === 100 ? (
                      <span className="text-info">Disponível</span>
                    ) : (
                      <span className="text-muted">
                        Complete todos os módulos
                      </span>
                    )}
                  </small>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="coursecard-footer d-flex justify-content-between align-items-center p-2 m-2 mt-0">
        {showStartButton && (
          <div className="d-flex flex-row align-items-center gap-2">
            {(CURSO_ASSINCRONO || (CURSO_SINCRONO && checkDate())) && (
              <button className="btn btn-primary" onClick={handleClick}>
                {progress === 0
                  ? "Começar"
                  : progress < 100
                  ? "Continuar"
                  : "Abrir curso"}
              </button>
            )}

            {CURSO_SINCRONO && checkDate() && (
              <button
                className="btn btn-outline-primary"
                onClick={() =>
                  navigate(`/dashboard/synchronous-course/${course.ID_CURSO}`)
                }
              >
                <GraduationCap size={20} />
                <span className="ms-2">Aulas</span>
              </button>
            )}

            {CURSO_SINCRONO && !checkDate() && (
              <span className="text-muted">O curso ainda não começou</span>
            )}

            {/* Botão do Quiz - aparece quando curso está completo mas quiz não foi feito */}
            {!loadingQuizStatus && shouldShowQuizButton() && (
              <button
                className="btn btn-info"
                onClick={handleClickQuiz}
                title="Fazer Quiz Final"
              >
                <span className="ms-2">Quiz</span>
              </button>
            )}

            {/* Botão do Certificado - aparece quando condições são atendidas */}
            {!loadingQuizStatus && shouldShowCertificateButton() && (
              <button
                className="btn btn-success"
                onClick={handleClickCertificado}
                title="Baixar Certificado"
              >
                <Download size={20} />
                <span className="ms-2">Certificado</span>
              </button>
            )}
          </div>
        )}

        {/* Edit and See buttons only for Gestor and Formador */}
        {isGestorOrFormador && showButtons && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/course/${course.ID_CURSO}`)}
            >
              <Eye size={20} color="rgb(255, 255, 255)" />
            </button>
            <button
              className="btn btn-primary"
              onClick={() =>
                navigate(`/dashboard/course/edit/${course.ID_CURSO}`)
              }
            >
              <Pen size={20} />
              <span className="ms-2">Editar</span>
            </button>
            <button
              className="btn btn-outline-success"
              onClick={() =>
                navigate(`/dashboard/synchronous-course/${course.ID_CURSO}`)
              }
            >
              <GraduationCap size={20} />
              <span className="ms-2">Aulas</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseCardDashboard;
