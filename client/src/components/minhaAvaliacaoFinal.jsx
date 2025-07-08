import React, { useState, useEffect } from "react";
import axios from "axios";
import ErrorMessage from "./error_message";
import { FileText, Calendar, User } from "lucide-react";

const MinhaAvaliacaoFinal = ({ cursoId, nomeCurso }) => {
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [avaliacaoFinal, setAvaliacaoFinal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchMinhaAvaliacaoFinal();
  }, [cursoId]);

  const fetchMinhaAvaliacaoFinal = async () => {
    try {
      setLoading(true);
      setNotFound(false);
      const response = await axios.get(
        `${URL}/api/avaliacoes-finais/minha/${cursoId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setAvaliacaoFinal(response.data);
      setError(null);
    } catch (error) {
      console.error("Erro ao procurar a avaliação final:", error);
      if (error.response?.status === 404) {
        setNotFound(true);
        setError(null);
      } else {
        setError("Erro ao carregar avaliação final. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getNotaColor = (nota) => {
    if (nota >= 16) return "success";
    if (nota >= 14) return "warning";
    if (nota >= 10) return "info";
    return "danger";
  };

  const getNotaStatus = (nota) => {
    if (nota >= 16) return "Excelente";
    if (nota >= 14) return "Bom";
    if (nota >= 10) return "Suficiente";
    return "Insuficiente";
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">A carregar...</span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="alert alert-info">
        <FileText size={20} className="me-2" />
        <strong>Avaliação final pendente</strong>
        <p className="mb-0 mt-2">
          A sua avaliação final ainda não foi disponibilizada pelo formador.
        </p>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onClose={() => setError(null)} />;
  }

  if (!avaliacaoFinal) {
    return null;
  }

  return (
    <div className="container p-0">
      <div className="card shadow-sm">
        <div className="card-header">
          <h5 className="mb-0">
            Avaliação final
            {nomeCurso && <span className="ms-2">- {nomeCurso}</span>}
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="text-center mb-0 align-items-center d-flex flex-column jusify-content-center">
                <h2
                  className={`text-${getNotaColor(avaliacaoFinal.NOTA_FINAL)}`}
                >
                  {avaliacaoFinal.NOTA_FINAL.toFixed(1)}/20
                </h2>
                <p className="lead mb-0">
                  {getNotaStatus(avaliacaoFinal.NOTA_FINAL)}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <h6 className="text-muted mb-2">
                  <Calendar size={16} className="me-1" />
                  Data de avaliação
                </h6>
                <p className="mb-0">
                  {new Date(avaliacaoFinal.DATA_AVALIACAO).toLocaleDateString(
                    "pt-PT",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>

              {avaliacaoFinal.Formador && (
                <div className="mb-3">
                  <h6 className="text-muted mb-2">
                    <User size={16} className="me-1" />
                    Avaliado por
                  </h6>
                  <p className="mb-0">
                    {avaliacaoFinal.Formador.NOME ||
                      avaliacaoFinal.Formador.USERNAME}
                  </p>
                </div>
              )}
            </div>
          </div>

          {avaliacaoFinal.OBSERVACAO && (
            <div className="mt-4">
              <h6 className="text-muted mb-2">
                <FileText size={16} className="me-1" />
                Observações do formador
              </h6>
              <div className="bg-light p-3 rounded">
                <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                  {avaliacaoFinal.OBSERVACAO}
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="text-muted mb-2">
              Escala de avaliação
            </h6>
            <div className="row small">
              <div className="col-6 col-md-3">
                <span className="badge bg-success me-1">16-20</span>
                <span>Excelente</span>
              </div>
              <div className="col-6 col-md-3">
                <span className="badge bg-warning me-1">14-15</span>
                <span>Bom</span>
              </div>
              <div className="col-6 col-md-3">
                <span className="badge bg-info me-1">10-13</span>
                <span>Suficiente</span>
              </div>
              <div className="col-6 col-md-3">
                <span className="badge bg-danger me-1">0-9</span>
                <span>Insuficiente</span>
              </div>
            </div>
          </div>

          {avaliacaoFinal.NOTA_FINAL >= 10 && (
            <div className="mt-4 alert alert-success">
              <strong>Parabéns!</strong> Completou com sucesso este curso.
              {avaliacaoFinal.NOTA_FINAL >= 16 && (
                <span className="ms-2">Com um resultado excecional!</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinhaAvaliacaoFinal;
