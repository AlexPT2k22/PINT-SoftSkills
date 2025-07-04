import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Users,
  Link as LinkIcon,
} from "lucide-react";
import "../styles/aulasSincronas.css"

const AulasSincronas = ({ cursoId, isTeacher = false }) => {
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAula, setSelectedAula] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [novaAula, setNovaAula] = useState({
    TITULO: "",
    DESCRICAO: "",
    LINK_ZOOM: "",
    DATA_AULA: "",
    HORA_INICIO: "",
    HORA_FIM: "",
    ID_MODULO: "",
  });
  const [modulos, setModulos] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [alunos, setAlunos] = useState([]);
  const [presencas, setPresencas] = useState({});
  const [savingPresencas, setSavingPresencas] = useState(false);
  const [formErrors, setFormErrors] = useState({
    data: false,
    hora: false,
  });

  useEffect(() => {
    fetchAulas();
    if (isTeacher) {
      fetchModulos();
    }
  }, [cursoId]);

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchAulas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${URL}/api/aulas/curso/${cursoId}`);
      setAulas(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar aulas:", error);
      setLoading(false);
    }
  };

  const fetchModulos = async () => {
    try {
      const response = await axios.get(`${URL}/api/cursos/${cursoId}`);
      console.log("Curso", response.data.MODULOS);
      setModulos(response.data.MODULOS || []);
    } catch (error) {
      console.error("Erro ao buscar módulos:", error);
    }
  };

  const handleCreateAula = async (e) => {
    e.preventDefault();
    const hoje = new Date(getCurrentDate());
    const dataAula = new Date(novaAula.DATA_AULA);
    const dataValida = dataAula >= hoje;
    const horaInicio = novaAula.HORA_INICIO;
    const horaFim = novaAula.HORA_FIM;
    const horaValida = horaFim > horaInicio;
    setFormErrors({
      data: !dataValida,
      hora: !horaValida,
    });
    if (!dataValida || !horaValida) {
      return;
    }
    try {
      setIsLoading(true);
      await axios.post(`${URL}/api/aulas`, {
        ...novaAula,
        ID_CURSO: cursoId,
      });
      setShowModal(false);
      setNovaAula({
        TITULO: "",
        DESCRICAO: "",
        LINK_ZOOM: "",
        DATA_AULA: "",
        HORA_INICIO: "",
        HORA_FIM: "",
        ID_MODULO: "",
      });
      fetchAulas();
    } catch (error) {
      console.error("Erro ao criar aula:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAulaStatus = async (aulaId, estado) => {
    try {
      await axios.put(`${URL}/api/aulas/${aulaId}`, {
        ESTADO: estado,
      });
      fetchAulas();
    } catch (error) {
      console.error("Erro ao atualizar estado da aula:", error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("pt-PT");
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Agendada":
        return "bg-info";
      case "Em andamento":
        return "bg-primary";
      case "Concluída":
        return "bg-success";
      case "Cancelada":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const handleOpenPresencasModal = (aula) => {
    setSelectedAula(aula);
    setLoadingStudents(true);

    // Buscar alunos e dados de presença já existentes
    Promise.all([
      // Buscar alunos inscritos no curso
      axios.get(`${URL}/api/cursos/${cursoId}/alunos`),

      // Buscar registros de presença existentes para esta aula
      axios.get(`${URL}/api/aulas/${aula.ID_AULA}/presenca`),
    ])
      .then(([studentsResponse, attendanceResponse]) => {
        setAlunos(studentsResponse.data);

        // Criar objeto de lookup para presenças por ID de aluno
        const presencasPorAluno = {};
        attendanceResponse.data.forEach((registro) => {
          presencasPorAluno[registro.ID_UTILIZADOR] = registro.PRESENTE;
        });

        setPresencas(presencasPorAluno);
      })
      .catch((error) => {
        console.error("Erro ao buscar dados de presenças:", error);
      })
      .finally(() => {
        setLoadingStudents(false);
      });
  };

  return (
    <div className="aulas-content">
      {isTeacher && (
        <div className="mb-4">
          <button
            className="btn btn-primary w-100 w-md-auto"
            onClick={() => setShowModal(true)}
          >
            Agendar Nova Aula
          </button>
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : aulas.length === 0 ? (
        <div className="alert alert-info">
          Nenhuma aula agendada para este curso.
        </div>
      ) : (
        <div className="aulas-list">
          {Array.isArray(aulas) ? (
            aulas.map((aula) => (
              <div
                key={aula.ID_AULA}
                className="card mb-3 aula-card"
              >
                <div className="card-body">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-2 mb-md-0">{aula.TITULO}</h5>
                    <span
                      className={`badge ${getStatusBadgeClass(
                        aula.ESTADO
                      )} fs-6`}
                    >
                      {aula.ESTADO}
                    </span>
                  </div>

                  <p className="card-text mb-3">{aula.DESCRICAO}</p>

                  <div className="row mb-3">
                    <div className="col-12 mb-2 mb-md-0">
                      <div className="d-flex align-items-center">
                        <Calendar size={16} className="me-2 text-muted" />
                        <small className="text-muted">{formatDate(aula.DATA_AULA)}</small>
                      </div>
                    </div>
                    <div className="col-12 ">
                      <div className="d-flex align-items-center">
                        <Clock size={16} className="me-2 text-muted" />
                        <small className="text-muted">
                          {aula.HORA_INICIO} - {aula.HORA_FIM}
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
                    <div className="mb-3 mb-md-0">
                      <span className="me-2 text-muted">Módulo:</span>
                      <span className="badge bg-secondary">
                        {aula.MODULO?.NOME || "N/A"}
                      </span>
                    </div>

                    <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
                      {aula.LINK_ZOOM && (
                        <a
                          href={aula.LINK_ZOOM}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <LinkIcon size={16} className="me-1" />
                          <span className="d-none d-sm-inline">Entrar na Aula</span>
                          <span className="d-sm-none">Entrar</span>
                        </a>
                      )}

                      {isTeacher && (
                        <>
                          {aula.ESTADO === "Agendada" && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() =>
                                handleUpdateAulaStatus(
                                  aula.ID_AULA,
                                  "Em andamento"
                                )
                              }
                            >
                              <Play size={16} className="me-1" />
                              <span className="d-none d-sm-inline">Iniciar Aula</span>
                              <span className="d-sm-none">Iniciar</span>
                            </button>
                          )}

                          {aula.ESTADO === "Em andamento" && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() =>
                                handleUpdateAulaStatus(aula.ID_AULA, "Concluída")
                              }
                            >
                              <CheckCircle size={16} className="me-1" />
                              <span className="d-none d-sm-inline">Concluir Aula</span>
                              <span className="d-sm-none">Concluir</span>
                            </button>
                          )}

                          {(aula.ESTADO === "Agendada" ||
                            aula.ESTADO === "Em andamento") && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleUpdateAulaStatus(aula.ID_AULA, "Cancelada")
                              }
                            >
                              <XCircle size={16} className="me-1" />
                              <span className="d-none d-sm-inline">Cancelar</span>
                              <span className="d-sm-none">Cancelar</span>
                            </button>
                          )}

                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleOpenPresencasModal(aula)}
                          >
                            <Users size={16} className="me-1" />
                            <span className="d-none d-sm-inline">Presenças</span>
                            <span className="d-sm-none">Presenças</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="alert alert-warning">Erro ao carregar aulas</div>
          )}
        </div>
      )}

      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
        tabIndex="-1"
        role="dialog"
        aria-hidden={!showModal}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Agendar Nova Aula</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateAula}>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">Título</label>
                    <input
                      type="text"
                      className="form-control"
                      value={novaAula.TITULO}
                      onChange={(e) =>
                        setNovaAula({ ...novaAula, TITULO: e.target.value })
                      }
                      required
                      placeholder="Insira o título da aula"
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">Sumário</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={novaAula.DESCRICAO}
                      onChange={(e) =>
                        setNovaAula({ ...novaAula, DESCRICAO: e.target.value })
                      }
                      placeholder="Insira um breve resumo da aula"
                      required
                    ></textarea>
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">Link aula</label>
                    <input
                      type="url"
                      className="form-control"
                      value={novaAula.LINK_ZOOM}
                      onChange={(e) =>
                        setNovaAula({ ...novaAula, LINK_ZOOM: e.target.value })
                      }
                      placeholder="Insira o link da aula no Zoom ou outra plataforma"
                    />
                  </div>

                  <div className="col-12 col-md-6 mb-3">
                    <label className="form-label">Data</label>
                    <input
                      type="date"
                      className={`form-control ${
                        formErrors.data ? "is-invalid" : ""
                      }`}
                      value={novaAula.DATA_AULA}
                      min={getCurrentDate()}
                      onChange={(e) =>
                        setNovaAula({ ...novaAula, DATA_AULA: e.target.value })
                      }
                      required
                    />
                    {formErrors.data && (
                      <div className="invalid-feedback">
                        A data da aula deve ser igual ou posterior à data atual.
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-md-6 mb-3">
                    <label className="form-label">Módulo</label>
                    <select
                      className="form-select"
                      value={novaAula.ID_MODULO}
                      onChange={(e) =>
                        setNovaAula({ ...novaAula, ID_MODULO: e.target.value })
                      }
                      required
                    >
                      <option value="">Selecione um módulo</option>
                      {modulos.map((modulo) => (
                        <option key={modulo.ID_MODULO} value={modulo.ID_MODULO}>
                          {modulo.NOME}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-6 col-md-3 mb-3">
                    <label className="form-label">Hora Início</label>
                    <input
                      type="time"
                      className={`form-control ${
                        formErrors.hora ? "is-invalid" : ""
                      }`}
                      value={novaAula.HORA_INICIO}
                      onChange={(e) =>
                        setNovaAula({
                          ...novaAula,
                          HORA_INICIO: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="col-6 col-md-3 mb-3">
                    <label className="form-label">Hora Fim</label>
                    <input
                      type="time"
                      className={`form-control ${
                        formErrors.hora ? "is-invalid" : ""
                      }`}
                      value={novaAula.HORA_FIM}
                      onChange={(e) =>
                        setNovaAula({ ...novaAula, HORA_FIM: e.target.value })
                      }
                      required
                    />
                    {formErrors.hora && (
                      <div className="invalid-feedback">
                        A hora de fim deve ser posterior à hora de início.
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer border-top-0 px-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        A agendar...
                      </>
                    ) : (
                      "Agendar Aula"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowModal(false)}
        ></div>
      )}

      {/* Modal de presenças */}
      {selectedAula && (
        <div
          className={`modal fade show`}
          style={{ display: "block" }}
          tabIndex="-1"
          role="dialog"
          aria-hidden="false"
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <span className="d-none d-md-inline">Presenças - {selectedAula.TITULO}</span>
                  <span className="d-md-none">Presenças</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedAula(null)}
                ></button>
              </div>
              <div className="modal-body">
                {loadingStudents ? (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">
                        A carregar os alunos...
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {alunos.length === 0 ? (
                      <div className="alert alert-info">
                        Não há alunos inscritos neste curso.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Aluno</th>
                              <th className="text-center">Presença</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alunos.map((aluno) => (
                              <tr key={aluno.ID_UTILIZADOR}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div>
                                      <div className="fw-medium">
                                        {aluno.UTILIZADOR.NOME ||
                                          aluno.UTILIZADOR.USERNAME}
                                      </div>
                                      <small className="text-muted d-md-none">
                                        {aluno.UTILIZADOR.EMAIL}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <div className="form-check form-switch d-flex justify-content-center">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`presenca-${aluno.ID_UTILIZADOR}`}
                                      checked={!!presencas[aluno.ID_UTILIZADOR]}
                                      onChange={(e) => {
                                        const isPresent = e.target.checked;
                                        setPresencas((prev) => ({
                                          ...prev,
                                          [aluno.ID_UTILIZADOR]: isPresent,
                                        }));
                                      }}
                                    />
                                    <label
                                      className="form-check-label ms-2 d-none d-md-inline"
                                      htmlFor={`presenca-${aluno.ID_UTILIZADOR}`}
                                    >
                                      {presencas[aluno.ID_UTILIZADOR]
                                        ? "Presente"
                                        : "Ausente"}
                                    </label>
                                  </div>
                                  <small className="d-md-none text-muted">
                                    {presencas[aluno.ID_UTILIZADOR]
                                      ? "Presente"
                                      : "Ausente"}
                                  </small>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedAula(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    setSavingPresencas(true);
                    try {
                      const attendanceData = Object.keys(presencas).map(
                        (studentId) => ({
                          ID_UTILIZADOR: studentId,
                          PRESENTE: presencas[studentId],
                        })
                      );

                      await axios.post(
                        `${URL}/api/presencas/${selectedAula.ID_AULA}/massa`,
                        { presencas: attendanceData }
                      );

                      setSavingPresencas(false);
                      setSelectedAula(null);
                    } catch (error) {
                      console.error("Erro ao guardar presenças:", error);
                      setSavingPresencas(false);
                    }
                  }}
                  disabled={savingPresencas}
                >
                  {savingPresencas ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <span className="d-none d-sm-inline">A guardar...</span>
                      <span className="d-sm-none">...</span>
                    </>
                  ) : (
                    <>
                      <span className="d-none d-sm-inline">Guardar presenças</span>
                      <span className="d-sm-none">Guardar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background escuro para o modal de presenças */}
      {selectedAula && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setSelectedAula(null)}
        ></div>
      )}
    </div>
  );
};

export default AulasSincronas;
