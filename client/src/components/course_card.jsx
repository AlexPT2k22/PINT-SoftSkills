import React from "react";
import { Award } from "lucide-react";
import "../styles/course_card.css";

function CourseCard({ course }) {
  const {
    titulo,
    imagem,
    tipo,
    tempoTotal,
    id,
    dataInicio,
    dataFim,
    vagasRestantes,
  } = course;

  const formatDate = (dateString) => {
    const options = { month: "numeric", day: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-PT", options);
  };

  return (
    <div className="card course-card">
      <img src={imagem} className="card-img-top" alt={titulo} />
      <div className="card-body">
        <div className="card-title d-flex justify-content-between align-items-center mb-1">
          <h5 className="mb-0">{titulo}</h5>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <p className="card-text mb-0">
            {tipo} - {tempoTotal}
          </p>
          <p className="card-text mb-0">
            {formatDate(dataInicio)} - {formatDate(dataFim)}
          </p>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <p className="card-text mb-0">Vagas restantes: {vagasRestantes}</p>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="card-text mb-0 d-flex align-items-center">
            <Award size={21} color="#39639C" />
            <p className="card-certificado ms-1 mb-0">Certificado disponivel</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
