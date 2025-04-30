import React from "react";
import "../styles/course_card.css";
import { useNavigate } from "react-router-dom";
import { Pen, Eye } from "lucide-react";

function CourseCardDashboard({ course }) {
  const { NOME, CURSO_ASSINCRONO, CURSO_SINCRONO, IMAGEM } = course;
  const navigate = useNavigate();

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
      </div>
      <div className="coursecard-footer d-flex justify-content-end align-items-center p-2 m-2 mt-0">
        <div className="card-text mb-0 d-flex align-items-center">
          <button
            className="btn btn-secondary me-1"
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
      </div>
    </div>
  );
}

export default CourseCardDashboard;
