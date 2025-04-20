import React from "react";
import { Award } from "lucide-react";
import "../styles/course_card.css";

function CourseCard({ course }) {
  const { NOME, CURSO_ASSINCRONO, CURSO_SINCRONO } = course;

  const formatDate = (dateString) => {
    const options = { month: "numeric", day: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-PT", options);
  };

  const LIMITE_VAGAS =
    CURSO_SINCRONO?.INSCRICAO_SINCRONO?.LIMITE_VAGAS_INT__ || 0;

  const DATA_INICIO = CURSO_SINCRONO?.DATA_INICIO || "NA";
  const DATA_FIM = CURSO_SINCRONO?.DATA_FIM || "NA";
  const tempoTotal = CURSO_SINCRONO?.TEMPO_TOTAL || "N/A";

  const tipo = CURSO_ASSINCRONO
    ? "Assíncrono"
    : CURSO_SINCRONO
    ? "Sincrono"
    : "Não especificado";

  return (
    <div className="card h-100 course-card">
      {CURSO_SINCRONO && LIMITE_VAGAS <= 10 && (
        <div className="z-1 position-absolute p-2">
          <span className="badge text-bg-info position-absolute p-2 fs-6">
            Mais Popular!
          </span>
        </div>
      )}
      <img
        src="./images/undraw_certificate.svg"
        className="card-img-top"
        alt={NOME}
      />
      <div className="card-body">
        <div className="card-title d-flex justify-content-between align-items-center mb-1">
          <h5 className="mb-0">{NOME}</h5>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <p className="card-text mb-0">
            {tipo} {tipo === "Sincrono" ? " - " + tempoTotal : ""}
          </p>
          <p className="card-text mb-0">
            {tipo === "Sincrono"
              ? formatDate(DATA_INICIO) + " - " + formatDate(DATA_FIM)
              : ""}
          </p>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <p className="card-text mb-0">
            {tipo === "Sincrono" ? "Vagas restantes: " + LIMITE_VAGAS : ""}
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
