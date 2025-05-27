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

const AulasSincronas = ({ cursoId, isTeacher = false }) => {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const response = await axios.get(
        `http://localhost:4000/api/aulas/curso/${cursoId}`
      );
      setAulas(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar aulas:", error);
      setLoading(false);
    }
  };

  const fetchModulos = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/cursos/${cursoId}`
      );
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
      await axios.post("http://localhost:4000/api/aulas", {
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
    }
  };

  const handleUpdateAulaStatus = async (aulaId, estado) => {
    try {
      await axios.put(`http://localhost:4000/api/aulas/${aulaId}`, {
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
      axios.get(`http://localhost:4000/api/cursos/${cursoId}/alunos`),

      // Buscar registros de presença existentes para esta aula
      axios.get(`http://localhost:4000/api/aulas/${aula.ID_AULA}/presenca`),
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
            className="btn btn-primary"
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
        <div className="list-group">
          {Array.isArray(aulas) ? (
            aulas.map((aula) => (
              <div
                key={aula.ID_AULA}
                className="list-group-item list-group-item-action flex-column align-items-start"
              >
                <div className="d-flex w-100 justify-content-between align-items-center mb-2">
                  <h5 className="mb-1">{aula.TITULO}</h5>
                  <span
                    className={`badge ${getStatusBadgeClass(
                      aula.ESTADO
                    )} align-items-center`}
                  >
                    {aula.ESTADO}
                  </span>
                </div>

                <p className="mb-1">{aula.DESCRICAO}</p>

                <div className="d-flex align-items-center mb-2">
                  <Calendar size={16} className="me-1" />
                  <small className="me-3">{formatDate(aula.DATA_AULA)}</small>

                  <Clock size={16} className="me-1" />
                  <small>
                    {aula.HORA_INICIO} - {aula.HORA_FIM}
                  </small>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex">
                    <span className="me-2">Módulo:</span>
                    <span className="badge bg-secondary">
                      {aula.MODULO?.NOME || "N/A"}
                    </span>
                  </div>

                  <div className="d-flex">
                    {aula.LINK_ZOOM && (
                      <a
                        href={aula.LINK_ZOOM}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        <LinkIcon size={16} className="me-1" />
                        Entrar na Aula
                      </a>
                    )}

                    {isTeacher && (
                      <>
                        {aula.ESTADO === "Agendada" && (
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() =>
                              handleUpdateAulaStatus(
                                aula.ID_AULA,
                                "Em andamento"
                              )
                            }
                          >
                            <Play size={16} className="me-1" />
                            Iniciar Aula
                          </button>
                        )}

                        {aula.ESTADO === "Em andamento" && (
                          <button
                            className="btn btn-sm btn-outline-success me-2"
                            onClick={() =>
                              handleUpdateAulaStatus(aula.ID_AULA, "Concluída")
                            }
                          >
                            <CheckCircle size={16} className="me-1" />
                            Concluir Aula
                          </button>
                        )}

                        {(aula.ESTADO === "Agendada" ||
                          aula.ESTADO === "Em andamento") && (
                          <button
                            className="btn btn-sm btn-outline-danger me-2"
                            onClick={() =>
                              handleUpdateAulaStatus(aula.ID_AULA, "Cancelada")
                            }
                          >
                            <XCircle size={16} className="me-1" />
                            Cancelar
                          </button>
                        )}

                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleOpenPresencasModal(aula)}
                        >
                          <Users size={16} className="me-1" />
                          Presenças
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="alert alert-warning">Erro ao carregar aulas</div>
          )}
        </div>
      )}

      {/* Modal para criar nova aula */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Agendar Nova Aula</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateAula}>
                  <div className="mb-3">
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

                  <div className="mb-3">
                    <label className="form-label">Sumário</label>
                    <textarea
                      className="form-control"
                      value={novaAula.DESCRICAO}
                      onChange={(e) =>
                        setNovaAula({ ...novaAula, DESCRICAO: e.target.value })
                      }
                      placeholder="Insira um breve resumo da aula"
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
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

                  <div className="mb-3">
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

                  <div className="row mb-3">
                    <div className="col">
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
                    <div className="col">
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

                  <div className="mb-3">
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

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Agendar Aula
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de presenças */}
      {selectedAula && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Presenças - {selectedAula.TITULO}
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
                              <th>Email</th>
                              <th>Presença</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alunos.map((aluno) => (
                              <tr key={aluno.ID_UTILIZADOR}>
                                <td>
                                  {aluno.UTILIZADOR.NOME ||
                                    aluno.UTILIZADOR.USERNAME}
                                </td>
                                <td>{aluno.UTILIZADOR.EMAIL}</td>
                                <td>
                                  <div className="form-check form-switch">
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
                                      className="form-check-label"
                                      htmlFor={`presenca-${aluno.ID_UTILIZADOR}`}
                                    >
                                      {presencas[aluno.ID_UTILIZADOR]
                                        ? "Presente"
                                        : "Ausente"}
                                    </label>
                                  </div>
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
                        `http://localhost:4000/api/presencas/${selectedAula.ID_AULA}/massa`,
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
                      A guardar...
                    </>
                  ) : (
                    "Guardar presenças"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AulasSincronas;
