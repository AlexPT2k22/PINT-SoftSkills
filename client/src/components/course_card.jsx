import React from "react";
import { Award, Star } from "lucide-react";
import "../styles/course_card.css";
import { useNavigate } from "react-router-dom";

function CourseCard({ course }) {
  const { NOME, CURSO_ASSINCRONO, CURSO_SINCRONO, IMAGEM } = course;
  const navigate = useNavigate();

  const getCourseStatus = () => {
    if (CURSO_ASSINCRONO) {
      return CURSO_ASSINCRONO.ESTADO === "Ativo" ? "Ativo" : "Inativo";
    }

    if (CURSO_SINCRONO) {
      return CURSO_SINCRONO.ESTADO;
    }

    return "Não disponível";
  };

  const getStatusClass = () => {
    const status = getCourseStatus();
    switch (status) {
      case "Em curso":
        return "bg-primary";
      case "Ativo":
        // Para cursos síncronos que ainda não começaram
        if (CURSO_SINCRONO) {
          const hoje = new Date();
          const dataInicio = new Date(CURSO_SINCRONO.DATA_INICIO);

          // Se é síncrono e ainda não começou, mostrar "Brevemente"
          if (hoje < dataInicio) {
            return "bg-info";
          }
        }
        // Se chegou aqui, não mostrar badge
        return null;
      default:
        return null; // ✅ Não mostrar outros badges
    }
  };

  const getStatusText = () => {
    const status = getCourseStatus();

    if (status === "Em curso") {
      return "Em curso";
    }

    if (status === "Ativo" && CURSO_SINCRONO) {
      const hoje = new Date();
      const dataInicio = new Date(CURSO_SINCRONO.DATA_INICIO);

      // Se é síncrono e ainda não começou
      if (hoje < dataInicio) {
        return "Brevemente";
      }
    }

    return null; // Não mostrar badge
  };

  const dificuldadeBadge = (dificuldade) => {
    switch (dificuldade) {
      case "Iniciante":
        return "bg-success";
      case "Intermédio":
        return "bg-warning";
      case "Difícil":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const formatDate = (dateString) => {
    const options = { month: "numeric", day: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-PT", options);
  };

  const DATA_INICIO = CURSO_SINCRONO?.DATA_INICIO || "N/A";
  const DATA_FIM = CURSO_SINCRONO?.DATA_FIM || "N/A";
  const VAGAS = CURSO_SINCRONO?.VAGAS || "N/A";
  //const tempoTotal = CURSO_SINCRONO?.TEMPO_TOTAL || "N/A";

  const tipo = CURSO_ASSINCRONO
    ? "Assíncrono"
    : CURSO_SINCRONO
    ? "Síncrono"
    : "Não especificado";

  const handleClick = () => {
    navigate(`/course/${course.ID_CURSO}`);
  };

  return (
    <div className="card h-100 course-card" onClick={handleClick}>
      <div className="z-1 position-absolute p-2">
        {getStatusClass() && (
          <span className={`badge ${getStatusClass()} fs-6`}>
            {getStatusText()}
          </span>
        )}
        <span
          className={`badge ${dificuldadeBadge(
            course.DIFICULDADE_CURSO__
          )} fs-6 ms-2`}
        >
          {course.DIFICULDADE_CURSO__
            ? course.DIFICULDADE_CURSO__
            : "Sem dificuldade"}
        </span>
      </div>
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
          {course.averageRating > 0 && (
            <div className="d-flex align-items-center mb-2">
              <div className="d-flex me-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    fill={
                      star <= Math.round(course.averageRating)
                        ? "#FFD700"
                        : "transparent"
                    }
                    color="#FFD700"
                  />
                ))}
              </div>
              <small className="text-muted">
                {course.averageRating.toFixed(1)} ({course.totalReviews}{" "}
                avaliação
                {course.totalReviews !== 1 ? "ões" : ""})
              </small>
            </div>
          )}
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
      </div>
      <div className="coursecard-footer d-flex justify-content-between align-items-center p-2 m-2 mt-0">
        <div className="card-text mb-0 d-flex align-items-center">
          <Award size={21} color="#39639C" />
          <p className="card-certificado ms-1 mb-0">Certificado disponivel</p>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
