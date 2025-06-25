import React, { useState, useEffect } from "react";
import axios from "axios";
import { MessageSquare, Calendar, User, AlertCircle } from "lucide-react";

const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function AnunciosPanel({ courseId, courseData }) {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnuncios();
  }, [courseId]);

  const fetchAnuncios = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${URL}/api/anuncios/curso/${courseId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setAnuncios(response.data.anuncios);
      } else {
        setError("Erro ao carregar anúncios");
      }
    } catch (error) {
      console.error("Erro ao buscar anúncios:", error);
      setError("Não foi possível carregar os anúncios");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return "Agora mesmo";
    } else if (diffMinutes < 60) {
      return `Há ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
    } else if (diffHours < 24) {
      return `Há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    } else if (diffDays < 7) {
      return `Há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
    } else {
      return date.toLocaleDateString("pt-PT", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando anúncios...</span>
        </div>
        <p className="mt-2 text-muted">Carregando anúncios do curso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <AlertCircle size={48} className="text-muted mb-3" />
        <h5 className="text-muted">Erro ao carregar anúncios</h5>
        <p className="text-muted">{error}</p>
        <button
          className="btn btn-outline-primary mt-2"
          onClick={fetchAnuncios}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="anuncios-panel">
      <div className="container d-flex flex-column p-0 mt-2">
        <h3 className="ps-2 fw-normal mb-3">Anúncios</h3>

        {courseData?.CURSO_SINCRONO?.UTILIZADOR && (
          <div className="ps-2 mb-3">
            <div className="d-flex align-items-center">
              <User size={16} className="me-2 text-muted" />
              <small className="text-muted">
                Formador:{" "}
                <strong>
                  <a
                    href={`/user/${courseData.CURSO_SINCRONO.UTILIZADOR.ID_UTILIZADOR}`}
                  >
                    {courseData.CURSO_SINCRONO.UTILIZADOR.NOME ||
                      courseData.CURSO_SINCRONO.UTILIZADOR.USERNAME}
                  </a>
                </strong>
              </small>
            </div>
          </div>
        )}
      </div>

      <div className="ps-2">
        {anuncios.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <MessageSquare size={64} className="text-muted mb-3" />
            <h5 className="text-muted">Ainda não há anúncios</h5>
            <p className="text-muted text-center mb-0">
              O formador ainda não publicou anúncios para este curso.
              <br />
              Os anúncios aparecerão aqui quando forem publicados.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {anuncios.map((anuncio) => (
              <div key={anuncio.ID_ANUNCIO} className="card border-0 ">
                <div className="card-body border border-1 rounded">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0 fw-semibold">
                      {anuncio.TITULO}
                    </h5>
                  </div>

                  <p
                    className="card-text mb-3"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {anuncio.CONTEUDO}
                  </p>

                  <div className="d-flex align-items-center text-muted small">
                    <Calendar size={14} className="me-1" />
                    <span className="me-3">
                      {formatDate(anuncio.DATA_CRIACAO)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnunciosPanel;
