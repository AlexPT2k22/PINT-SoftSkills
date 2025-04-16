import React from "react";

function CourseCard({ course }) {
  const { titulo, imagem, tipo, tempoTotal, id, dataInicio, dataFim } = course;

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-PT", options);
  };

  return (
    <div className="card course-card shadow" style={{ width: "18rem" }}>
      <img src={imagem} className="card-img-top" alt={titulo} />
      <div className="card-body">
        <h5 className="card-title">{titulo}</h5>
        <p className="card-text">Tipo: {tipo}</p>
        <p className="card-text">Duração: {tempoTotal} horas</p>
        <p className="card-text">Data de início: {formatDate(dataInicio)}</p>
        <p className="card-text">Data de fim: {formatDate(dataFim)}</p>
        <a href={`/course/${id}`} className="btn btn-primary">
          Ver curso
        </a>
      </div>
    </div>
  );
}

export default CourseCard;
