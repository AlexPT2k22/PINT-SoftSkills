import React from "react";
import "../styles/course_card.css";
import { useNavigate } from "react-router-dom";
import { Pen, Eye, Download } from "lucide-react";
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
        `http://localhost:4000/api/certificados/gerar/${course.ID_CURSO}`,
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

  // Get user data from auth store
  const user = useAuthStore((state) => state.user);
  const userType = user?.perfil;

  // Check if user is admin or teacher
  const isGestorOrFormador = userType === 3 || userType === 2; // Gestor (3) or Formador (2)

  const formatDate = (dateString) => {
    const options = { month: "numeric", day: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-PT", options);
  };

  const DATA_INICIO = CURSO_SINCRONO?.DATA_INICIO || "N/A";
  const DATA_FIM = CURSO_SINCRONO?.DATA_FIM || "N/A";
  const VAGAS = CURSO_SINCRONO?.VAGAS || "N/A";

  const tipo = CURSO_ASSINCRONO
    ? "Assíncrono"
    : CURSO_SINCRONO
    ? "Síncrono"
    : "Não especificado";

  return (
    <div className="card h-100 course-card">
      {CURSO_SINCRONO && VAGAS <= 10 && (
        <div className="z-1 position-absolute p-2">
          <span className="badge text-bg-info position-absolute p-2 fs-6">
            Mais Popular!
          </span>
        </div>
      )}
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
        <div className="d-flex justify-content-between align-items-center">
          <p className="card-text mb-0">
            {tipo === "Síncrono" ? "Vagas restantes: " + VAGAS : ""}
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
          </>
        )}
      </div>

      <div className="coursecard-footer d-flex justify-content-between align-items-center p-2 m-2 mt-0">
        {showStartButton && (
          <div className="d-flex flex-row align-items-center gap-2">
            <button className="btn btn-primary" onClick={handleClick}>
              {progress === 0
                ? "Começar"
                : progress < 100
                ? "Continuar"
                : "Abrir curso"}
            </button>
            {progress === 100 && (
              <button
                className="btn btn-secondary align-items-center"
                onClick={handleClickCertificado}
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
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseCardDashboard;
