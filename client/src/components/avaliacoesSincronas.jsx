import React, { useState, useEffect } from "react";
import axios from "axios";
import ErrorMessage from "./error_message";

const AvaliacoesSincronas = ({ cursoId, isTeacher = false }) => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [novaAvaliacao, setNovaAvaliacao] = useState({
    NOTA: "",
    OBSERVACAO: "",
    DATA_LIMITE_REALIZACAO: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false);

  useEffect(() => {
    fetchAvaliacoes();
  }, [cursoId]);

  const fetchAvaliacoes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:4000/api/avaliacoes/curso/${cursoId}`,
        {
          withCredentials: true,
        }
      );

      // Verifique a estrutura da resposta
      console.log("Resposta da API:", response.data);

      // Garantir que avaliacoes seja sempre um array
      if (response.data && Array.isArray(response.data)) {
        setAvaliacoes(response.data);
      } else if (
        response.data &&
        response.data.avaliacoes &&
        Array.isArray(response.data.avaliacoes)
      ) {
        // Se a resposta contiver um objeto com propriedade avaliacoes
        setAvaliacoes(response.data.avaliacoes);
      } else {
        // Fallback seguro - sempre definir como array vazio se não for array
        console.warn("Avaliações não é um array:", response.data);
        setAvaliacoes([]);
      }

      setError(null);
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
      setError("Erro ao carregar avaliações. Por favor, tente novamente.");
      setAvaliacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/avaliacoes", {
        ...novaAvaliacao,
        ID_CURSO: cursoId,
      });
      fetchAvaliacoes();
      setNovaAvaliacao({
        NOTA: "",
        OBSERVACAO: "",
        DATA_LIMITE_REALIZACAO: "",
      });
    } catch (error) {
      console.error("Erro ao criar avaliação:", error);
    }
  };

  return (
    <div className="container mt-4">
      {/* Button to trigger modal - only visible for teachers */}
      {isTeacher && (
        <div className="mb-4">
          <button
            className="btn btn-primary"
            onClick={() => setShowAvaliacaoModal(true)}
          >
            Criar Avaliação
          </button>
        </div>
      )}

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Modal for creating new evaluation */}
      <div
        className={`modal fade ${showAvaliacaoModal ? "show" : ""}`}
        style={{ display: showAvaliacaoModal ? "block" : "none" }}
        tabIndex="-1"
        role="dialog"
        aria-hidden={!showAvaliacaoModal}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nova Avaliação</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAvaliacaoModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nota</label>
                  <input
                    type="number"
                    className="form-control"
                    value={novaAvaliacao.NOTA}
                    onChange={(e) =>
                      setNovaAvaliacao({
                        ...novaAvaliacao,
                        NOTA: e.target.value,
                      })
                    }
                    min="0"
                    max="20"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Observação</label>
                  <textarea
                    className="form-control"
                    value={novaAvaliacao.OBSERVACAO}
                    onChange={(e) =>
                      setNovaAvaliacao({
                        ...novaAvaliacao,
                        OBSERVACAO: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Data Limite</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={novaAvaliacao.DATA_LIMITE_REALIZACAO}
                    onChange={(e) =>
                      setNovaAvaliacao({
                        ...novaAvaliacao,
                        DATA_LIMITE_REALIZACAO: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAvaliacaoModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Criar Avaliação
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for modal */}
      {showAvaliacaoModal && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowAvaliacaoModal(false)}
        ></div>
      )}

      {/* Lista de avaliações */}

      {loading ? (
        <div className="d-flex justify-content-center my-3">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">A carregar...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Nota</th>
                  <th>Estado</th>
                  <th>Observação</th>
                  <th>Data Limite</th>
                </tr>
              </thead>
              <tbody>
                {avaliacoes.length > 0 ? (
                  avaliacoes.map((avaliacao) => (
                    <tr key={avaliacao.ID_AVALIACAO_SINCRONA}>
                      <td>
                        {new Date(
                          avaliacao.DATA_REALIZACAO
                        ).toLocaleDateString()}
                      </td>
                      <td>{avaliacao.NOTA}</td>
                      <td>{avaliacao.ESTADO}</td>
                      <td>{avaliacao.OBSERVACAO}</td>
                      <td>
                        {avaliacao.DATA_LIMITE_REALIZACAO
                          ? new Date(
                              avaliacao.DATA_LIMITE_REALIZACAO
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      Nenhuma avaliação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AvaliacoesSincronas;
