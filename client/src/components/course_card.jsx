import React from "react";
import { Award } from "lucide-react";
import "../styles/course_card.css";
import { useNavigate } from "react-router-dom";

function CourseCard({ course }) {
  const { NOME, CURSO_ASSINCRONO, CURSO_SINCRONO, IMAGEM } = course;
  const navigate = useNavigate();

  const calculateStatus = (course) => {
    if (course.CURSO_SINCRONO) {
      const { DATA_INICIO, DATA_FIM } = course.CURSO_SINCRONO;
      const now = new Date();
      if (now < new Date(DATA_INICIO)) {
        return "Brevemente";
      } else if (now >= new Date(DATA_INICIO) && now <= new Date(DATA_FIM)) {
        return "Em curso";
      } else {
        return "Terminado";
      }
    } else if (course.CURSO_ASSINCRONO) {
      const { DATA_INICIO, DATA_FIM } = course.CURSO_ASSINCRONO;
      const now = new Date();
      if (
        now < new Date(DATA_INICIO) ||
        (now >= new Date(DATA_INICIO) && now <= new Date(DATA_FIM))
      ) {
        return "Ativo";
      } else {
        return "Terminado";
      }
    } else {
      return "Não especificado";
    }
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case "Ativo":
        return "bg-success";
      case "Em curso":
        return "bg-primary";
      case "Inativo":
        return "bg-secondary";
      case "Terminado":
        return "bg-danger";
      case "Brevemente":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
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
        <span
          className={`badge ${statusBadgeClass(calculateStatus(course))} fs-6`}
        >
          {calculateStatus(course)
            ? calculateStatus(course)
            : "Status desconhecido"}
        </span>
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
