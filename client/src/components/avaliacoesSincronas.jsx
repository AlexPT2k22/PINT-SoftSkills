import React, { useState, useEffect } from "react";
import axios from "axios";
import ErrorMessage from "./error_message";
import useAuthStore from "../store/authStore";
import { Upload, FileText, Check, X, ExternalLink } from "lucide-react";

const AvaliacoesSincronas = ({ cursoId, isTeacher = false }) => {
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [minhasSubmissoes, setMinhasSubmissoes] = useState({});
  const [avaliacaoAtual, setAvaliacaoAtual] = useState(null);
  const [submissoes, setSubmissoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false);
  const [showSubmissaoModal, setShowSubmissaoModal] = useState(false);
  const [showAvaliarModal, setShowAvaliarModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);

  const { user } = useAuthStore();

  const [novaAvaliacao, setNovaAvaliacao] = useState({
    TITULO: "",
    DESCRICAO: "",
    DATA_LIMITE_REALIZACAO: "",
    CRITERIOS: "",
  });

  const [novaSubmissao, setNovaSubmissao] = useState({
    ID_AVALIACAO: "",
    DESCRICAO: "",
    ARQUIVO: null,
  });

  const [novaNotaSubmissao, setNovaNotaSubmissao] = useState({
    ID_SUBMISSAO: "",
    NOTA: "",
    OBSERVACAO: "",
  });

  useEffect(() => {
    fetchAvaliacoes();
    if (!isTeacher) {
      fetchMinhasSubmissoes();
    }
  }, [cursoId]);

  const fetchAvaliacoes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${URL}/api/avaliacoes/curso/${cursoId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setAvaliacoes(response.data);
      } else if (
        response.data &&
        response.data.avaliacoes &&
        Array.isArray(response.data.avaliacoes)
      ) {
        setAvaliacoes(response.data.avaliacoes);
      } else {
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

  const fetchMinhasSubmissoes = async () => {
    try {
      const response = await axios.get(
        `${URL}/api/avaliacoes/minhas-submissoes/${cursoId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const subsPorAvaliacao = {};
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((sub) => {
          subsPorAvaliacao[sub.ID_AVALIACAO_SINCRONA] = sub;
        });
      }
      setMinhasSubmissoes(subsPorAvaliacao);
    } catch (error) {
      console.error("Erro ao buscar submissões:", error);
    }
  };

  const fetchSubmissoesPorAvaliacao = async (avaliacaoId) => {
    try {
      setLoadingSub(true);
      const response = await axios.get(
        `${URL}/api/avaliacoes/${avaliacaoId}/submissoes`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setSubmissoes(response.data);
      } else {
        setSubmissoes([]);
      }
    } catch (error) {
      console.error("Erro ao buscar submissões da avaliação:", error);
      setError("Erro ao carregar submissões.");
    } finally {
      setLoadingSub(false);
    }
  };

  const handleSubmitNovaAvaliacao = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      await axios.post(
        `${URL}/api/avaliacoes`,
        {
          ...novaAvaliacao,
          ID_CURSO: cursoId,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      fetchAvaliacoes();
      setNovaAvaliacao({
        TITULO: "",
        DESCRICAO: "",
        DATA_LIMITE_REALIZACAO: "",
        CRITERIOS: "",
      });
      setShowAvaliacaoModal(false);
    } catch (error) {
      console.error("Erro ao criar avaliação:", error);
      setError("Erro ao criar avaliação. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitSubmissao = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("ID_AVALIACAO", avaliacaoAtual.ID_AVALIACAO_SINCRONA);
    formData.append("DESCRICAO", novaSubmissao.DESCRICAO);

    if (novaSubmissao.ARQUIVO) {
      formData.append("ARQUIVO", novaSubmissao.ARQUIVO);
    }

    try {
      setUploading(true);
      await axios.post(`${URL}/api/avaliacoes/submeter`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      fetchMinhasSubmissoes();
      setShowSubmissaoModal(false);
      setNovaSubmissao({
        ID_AVALIACAO: "",
        DESCRICAO: "",
        ARQUIVO: null,
      });
    } catch (error) {
      console.error("Erro ao submeter trabalho:", error);
      setError("Erro ao submeter trabalho. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleAvaliarSubmissao = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      await axios.post(
        `${URL}/api/avaliacoes/avaliar-submissao`,
        novaNotaSubmissao,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      await axios.post(
        `${URL}/api/user/update-evaluation-grade`,
        {
          submissaoId: novaNotaSubmissao.ID_SUBMISSAO,
          nota: novaNotaSubmissao.NOTA,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      fetchSubmissoesPorAvaliacao(avaliacaoAtual.ID_AVALIACAO_SINCRONA);
      setNovaNotaSubmissao({
        ID_SUBMISSAO: "",
        NOTA: "",
        OBSERVACAO: "",
      });
    } catch (error) {
      console.error("Erro ao avaliar submissão:", error);
      setError("Erro ao avaliar submissão. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    setNovaSubmissao({
      ...novaSubmissao,
      ARQUIVO: e.target.files[0],
    });
  };

  const openSubmissaoModal = (avaliacao) => {
    setAvaliacaoAtual(avaliacao);
    setNovaSubmissao({
      ID_AVALIACAO: avaliacao.ID_AVALIACAO_SINCRONA,
      DESCRICAO: "",
      ARQUIVO: null,
    });
    setShowSubmissaoModal(true);
  };

  const openSubmissoesModal = (avaliacao) => {
    setAvaliacaoAtual(avaliacao);
    fetchSubmissoesPorAvaliacao(avaliacao.ID_AVALIACAO_SINCRONA);
    setShowAvaliarModal(true);
  };

  const getDataStatus = (dataLimite) => {
    if (!dataLimite) return "";

    const hoje = new Date();
    const limite = new Date(dataLimite);

    if (hoje > limite) {
      return "Fechado";
    } else {
      return "Aberto";
    }
  };

  return (
    <div className="container p-0">
      {isTeacher && (
        <div className="mb-4">
          <button
            className="btn btn-primary"
            onClick={() => setShowAvaliacaoModal(true)}
          >
            Criar Nova Avaliação
          </button>
        </div>
      )}

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Modal para criar nova avaliação (professor) */}
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
              <h5 className="modal-title">Criar Nova Avaliação</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAvaliacaoModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitNovaAvaliacao}>
                <div className="mb-3">
                  <label className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-control"
                    value={novaAvaliacao.TITULO}
                    onChange={(e) =>
                      setNovaAvaliacao({
                        ...novaAvaliacao,
                        TITULO: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descrição/Instruções</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={novaAvaliacao.DESCRICAO}
                    onChange={(e) =>
                      setNovaAvaliacao({
                        ...novaAvaliacao,
                        DESCRICAO: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Critérios de Avaliação</label>
                  <textarea
                    className="form-control"
                    value={novaAvaliacao.CRITERIOS}
                    onChange={(e) =>
                      setNovaAvaliacao({
                        ...novaAvaliacao,
                        CRITERIOS: e.target.value,
                      })
                    }
                    placeholder="Descreva os critérios para a avaliação"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Data Limite de Entrega</label>
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
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        A criar...
                      </>
                    ) : (
                      "Criar Avaliação"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para submeter trabalho (aluno) */}
      <div
        className={`modal fade ${showSubmissaoModal ? "show" : ""}`}
        style={{ display: showSubmissaoModal ? "block" : "none" }}
        tabIndex="-1"
        role="dialog"
        aria-hidden={!showSubmissaoModal}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Submeter Trabalho</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowSubmissaoModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {avaliacaoAtual && (
                <>
                  <div className="mb-3">
                    <h6>{avaliacaoAtual.TITULO}</h6>
                    <p>{avaliacaoAtual.DESCRICAO}</p>
                    {avaliacaoAtual.CRITERIOS && (
                      <div className="alert alert-info">
                        <strong>Critérios de avaliação:</strong>
                        <br />
                        {avaliacaoAtual.CRITERIOS}
                      </div>
                    )}
                    <p>
                      <small>
                        Data limite:{" "}
                        {new Date(
                          avaliacaoAtual.DATA_LIMITE_REALIZACAO
                        ).toLocaleString()}
                      </small>
                    </p>
                  </div>
                  <hr />
                </>
              )}
              <form onSubmit={handleSubmitSubmissao}>
                <div className="mb-3">
                  <label className="form-label">Descrição da Submissão</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={novaSubmissao.DESCRICAO}
                    onChange={(e) =>
                      setNovaSubmissao({
                        ...novaSubmissao,
                        DESCRICAO: e.target.value,
                      })
                    }
                    placeholder="Descreva seu trabalho ou deixe comentários para o formador"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Arquivo</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowSubmissaoModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        A enviar...
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="me-1" />
                        Submeter Trabalho
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para ver e avaliar submissões (professor) */}
      <div
        className={`modal fade ${showAvaliarModal ? "show" : ""}`}
        style={{ display: showAvaliarModal ? "block" : "none" }}
        tabIndex="-1"
        role="dialog"
        aria-hidden={!showAvaliarModal}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {avaliacaoAtual
                  ? `Submissões - ${avaliacaoAtual.TITULO}`
                  : "Submissões"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAvaliarModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {loadingSub ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">A carregar...</span>
                  </div>
                </div>
              ) : submissoes.length === 0 ? (
                <div className="alert alert-info">
                  Ainda não há submissões para esta avaliação.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Aluno</th>
                        <th>Data Submissão</th>
                        <th>Arquivo</th>
                        <th>Nota</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissoes.map((submissao) => (
                        <tr key={submissao.ID_SUBMISSAO}>
                          <td>
                            {submissao.UTILIZADOR?.NOME ||
                              submissao.UTILIZADOR?.USERNAME ||
                              "N/A"}
                          </td>
                          <td>
                            {new Date(
                              submissao.DATA_SUBMISSAO
                            ).toLocaleString()}
                          </td>
                          <td>
                            {submissao.URL_ARQUIVO ? (
                              <a
                                href={`${URL}${submissao.URL_ARQUIVO}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                              >
                                <FileText size={16} className="me-1" />
                                Ver Arquivo
                              </a>
                            ) : (
                              <span className="badge bg-secondary">
                                Sem arquivo
                              </span>
                            )}
                          </td>
                          <td>
                            {submissao.NOTA ? (
                              <span
                                className={`badge ${
                                  submissao.NOTA >= 10
                                    ? "bg-success"
                                    : "bg-danger"
                                }`}
                              >
                                {submissao.NOTA}/20
                              </span>
                            ) : (
                              <span className="badge bg-warning text-dark">
                                Pendente
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setNovaNotaSubmissao({
                                  ID_SUBMISSAO: submissao.ID_SUBMISSAO,
                                  NOTA: submissao.NOTA || "",
                                  OBSERVACAO: submissao.OBSERVACAO || "",
                                });

                                document
                                  .getElementById(
                                    `avaliar-form-${submissao.ID_SUBMISSAO}`
                                  )
                                  .classList.toggle("d-none");
                              }}
                            >
                              {submissao.NOTA ? "Editar Nota" : "Avaliar"}
                            </button>
                            <div
                              id={`avaliar-form-${submissao.ID_SUBMISSAO}`}
                              className="mt-2 d-none"
                            >
                              <form
                                onSubmit={handleAvaliarSubmissao}
                                className="border rounded p-2"
                              >
                                <div className="mb-2">
                                  <label className="form-label">
                                    Nota (0-20)
                                  </label>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    min="0"
                                    max="20"
                                    value={novaNotaSubmissao.NOTA}
                                    onChange={(e) =>
                                      setNovaNotaSubmissao({
                                        ...novaNotaSubmissao,
                                        NOTA: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </div>
                                <div className="mb-2">
                                  <label className="form-label">
                                    Observação
                                  </label>
                                  <textarea
                                    className="form-control form-control-sm"
                                    rows="2"
                                    value={novaNotaSubmissao.OBSERVACAO}
                                    onChange={(e) =>
                                      setNovaNotaSubmissao({
                                        ...novaNotaSubmissao,
                                        OBSERVACAO: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="d-flex justify-content-end gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => {
                                      document
                                        .getElementById(
                                          `avaliar-form-${submissao.ID_SUBMISSAO}`
                                        )
                                        .classList.add("d-none");
                                    }}
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="submit"
                                    className="btn btn-sm btn-success"
                                  >
                                    <Check size={16} className="me-1" />
                                    Guardar
                                  </button>
                                </div>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAvaliarModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlays para os modais */}
      {showAvaliacaoModal && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowAvaliacaoModal(false)}
        ></div>
      )}

      {showSubmissaoModal && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowSubmissaoModal(false)}
        ></div>
      )}

      {showAvaliarModal && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowAvaliarModal(false)}
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
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Descrição</th>
                  <th>Data Limite</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {avaliacoes.length > 0 ? (
                  avaliacoes.map((avaliacao) => {
                    const status = getDataStatus(
                      avaliacao.DATA_LIMITE_REALIZACAO
                    );
                    const jaSubmeti =
                      minhasSubmissoes[avaliacao.ID_AVALIACAO_SINCRONA];

                    return (
                      <tr key={avaliacao.ID_AVALIACAO_SINCRONA}>
                        <td>{avaliacao.TITULO}</td>
                        <td>
                          {avaliacao.DESCRICAO?.length > 50
                            ? avaliacao.DESCRICAO.substring(0, 50) + "..."
                            : avaliacao.DESCRICAO}
                        </td>
                        <td>
                          {avaliacao.DATA_LIMITE_REALIZACAO
                            ? new Date(
                                avaliacao.DATA_LIMITE_REALIZACAO
                              ).toLocaleString()
                            : "-"}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              status === "Aberto" ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td>
                          {isTeacher ? (
                            // Ações para o professor
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openSubmissoesModal(avaliacao)}
                            >
                              <FileText size={16} className="me-1" />
                              Ver Submissões
                            </button>
                          ) : (
                            <>
                              {jaSubmeti ? (
                                <div>
                                  <span className="badge bg-success me-2">
                                    Submetido
                                  </span>
                                  {jaSubmeti.NOTA && (
                                    <span
                                      className={`badge ${
                                        jaSubmeti.NOTA >= 10
                                          ? "bg-success"
                                          : "bg-danger"
                                      }`}
                                    >
                                      Nota: {jaSubmeti.NOTA}/20
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => openSubmissaoModal(avaliacao)}
                                  disabled={status !== "Aberto"}
                                >
                                  <Upload size={16} className="me-1" />
                                  Submeter Trabalho
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
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
