import React from "react";

function CourseCard({ course }) {
  const { titulo, imagem, tipo, tempoTotal, id, dataInicio, dataFim } = course;

  const formatDate = (dateString) => {
    const options = { month: "numeric", day: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-PT", options);
  };

  return (
    <div className="card course-card shadow" style={{ width: "20rem" }}>
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
        <div className="d-flex justify-content-between align-items-center mt-2">
          <a href={`/course/${id}`} className="btn btn-primary">
            Ver curso
          </a>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
