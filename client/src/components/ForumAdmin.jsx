import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavbarDashboard from "./navbarDashboard.jsx";
import Sidebar from "./sidebar.jsx";
import {
  MessageSquare,
  Plus,
  CheckCircle,
  Flag,
  Clock,
  Eye,
  Trash2,
} from "lucide-react";
import SuccessMessage from "./sucess_message.jsx";
import ErrorMessage from "./error_message.jsx";

const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const ForumAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("solicitacoes");
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [topicos, setTopicos] = useState([]);
  const [novoTopico, setNovoTopico] = useState({
    categoriaId: "",
    areaId: "",
    topicoId: "",
    titulo: "",
    descricao: "",
  });
  const [numTopicos, setNumTopicos] = useState(null);
  const [showRespostaModal, setShowRespostaModal] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [respostaData, setRespostaData] = useState({
    decisao: "",
    resposta: "",
    dadosTopico: {
      titulo: "",
      descricao: "",
    },
  });

  useEffect(() => {
    fetchCategorias();
    fetchTopicos();
    fetchSolicitacoes();
    fetchDenuncias();
  }, []);

  useEffect(() => {
    if (novoTopico.categoriaId) {
      fetchAreas(novoTopico.categoriaId);
    } else {
      setAreas([]);
      setTopicos([]);
    }
  }, [novoTopico.categoriaId]);

  useEffect(() => {
    if (novoTopico.areaId) {
      fetchTopicosList(novoTopico.areaId);
    } else {
      setTopicos([]);
    }
  }, [novoTopico.areaId]);

  const fetchAreas = async (categoriaId) => {
    try {
      const response = await axios.get(`${URL}/api/categorias/com-areas`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const categoriaEncontrada = response.data.find(
          (cat) => cat.ID_CATEGORIA__PK___ === parseInt(categoriaId)
        );

        if (categoriaEncontrada && categoriaEncontrada.AREAs) {
          setAreas(categoriaEncontrada.AREAs);
        } else {
          setAreas([]);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar áreas:", error);
      setErrorMessage("Erro ao carregar áreas");
    }
  };

  const fetchTopicosList = async (areaId) => {
    try {
      const response = await axios.get(`${URL}/api/topicos/by-area/${areaId}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setTopicos(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar tópicos:", error);
      setErrorMessage("Erro ao carregar tópicos");
    }
  };

  const fetchTopicos = async () => {
    try {
      const response = await axios.get(`${URL}/api/forum/topicos/count`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setNumTopicos(response.data.count);
      }
    } catch (error) {
      console.error("Erro ao buscar tópicos:", error);
      setErrorMessage("Erro ao carregar estatísticas de tópicos");
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${URL}/api/categorias`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setCategorias(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      setErrorMessage("Erro ao carregar categorias");
    }
  };

  const fetchSolicitacoes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${URL}/api/forum/solicitacoes?estado=Pendente`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setSolicitacoes(response.data.solicitacoes);
      }
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
      setErrorMessage("Erro ao carregar solicitações pendentes");
    } finally {
      setLoading(false);
    }
  };

  const fetchDenuncias = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${URL}/api/forum/denuncias?estado=Pendente`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setDenuncias(response.data.denuncias);
      }
    } catch (error) {
      console.error("Erro ao buscar denúncias:", error);
      setErrorMessage("Erro ao carregar denúncias pendentes");
    } finally {
      setLoading(false);
    }
  };

  const handleResponderSolicitacao = async () => {
    try {
      setLoadingButton(true);
      const response = await axios.put(
        `${URL}/api/forum/solicitacoes/${solicitacaoSelecionada.ID_FORUM_SOLICITACAO}/responder`,
        respostaData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setShowRespostaModal(false);
        setSolicitacaoSelecionada(null);
        setRespostaData({
          decisao: "",
          resposta: "",
          dadosTopico: { titulo: "", descricao: "" },
        });
        fetchSolicitacoes();
        fetchTopicos();
        setSuccessMessage(
          `Solicitação ${respostaData.decisao.toLowerCase()} com sucesso!`
        );
      }
    } catch (error) {
      console.error("Erro ao responder solicitação:", error);
      setErrorMessage(
        error.response?.data?.message || "Erro ao responder solicitação"
      );
    } finally {
      setLoadingButton(false);
    }
  };

  const handleCreateTopico = async (e) => {
    e.preventDefault();

    // Validação
    if (
      !novoTopico.categoriaId ||
      !novoTopico.areaId ||
      !novoTopico.topicoId ||
      !novoTopico.titulo.trim() ||
      !novoTopico.descricao.trim()
    ) {
      setErrorMessage("Todos os campos são obrigatórios");
      return;
    }

    if (novoTopico.titulo.length < 5) {
      setErrorMessage("O título deve ter pelo menos 5 caracteres");
      return;
    }

    if (novoTopico.descricao.length < 10) {
      setErrorMessage("A descrição deve ter pelo menos 10 caracteres");
      return;
    }

    try {
      setLoadingButton(true);
      const response = await axios.post(
        `${URL}/api/forum/topicos`,
        {
          categoriaId: novoTopico.categoriaId,
          areaId: novoTopico.areaId,
          topicoId: novoTopico.topicoId,
          titulo: novoTopico.titulo.trim(),
          descricao: novoTopico.descricao.trim(),
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setShowCreateModal(false);
        setNovoTopico({
          categoriaId: "",
          areaId: "",
          topicoId: "",
          titulo: "",
          descricao: "",
        });
        setAreas([]);
        setTopicos([]);
        fetchTopicos(); // Atualizar contagem
        setSuccessMessage("Tópico de fórum criado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao criar tópico:", error);
      setErrorMessage(
        error.response?.data?.message || "Erro ao criar tópico de fórum"
      );
    } finally {
      setLoadingButton(false);
    }
  };

  const handleDeleteDenuncia = async (denunciaId) => {
    try {
      const response = await axios.delete(
        `${URL}/api/forum/denuncias/post/${denunciaId}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setSuccessMessage("Denúncia eliminada com sucesso!");
        fetchDenuncias(); // Atualizar lista de denúncias
      } else {
        setErrorMessage("Erro ao eliminar denúncia");
      }
    } catch (error) {
      console.error("Erro ao eliminar denúncia:", error);
      setErrorMessage(
        error.response?.data?.message || "Erro ao eliminar denúncia"
      );
    }
  };

  const openRespostaModal = (solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setRespostaData({
      decisao: "",
      resposta: "",
      dadosTopico: {
        titulo: solicitacao.TITULO_SUGERIDO,
        descricao: solicitacao.JUSTIFICATIVA,
      },
    });
    setShowRespostaModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNovoTopico({
      categoriaId: "",
      areaId: "",
      topicoId: "",
      titulo: "",
      descricao: "",
    });
    setAreas([]);
    setTopicos([]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("pt-PT");
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar />

      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}

      <div className="container mt-4 p-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-10">
            <h2 className="mb-1">Painel administrativo do fórum</h2>
          </div>
          <div className="col-2 text-end">
            <button
              className="btn btn-outline-primary mb-3"
              onClick={() => navigate("/forum")}
            >
              Ir para o fórum
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <Clock size={24} className="text-warning mb-2" />
                <h4>{solicitacoes.length}</h4>
                <small>Solicitações Pendentes</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <Flag size={24} className="text-danger mb-2" />
                <h4>{denuncias.length}</h4>
                <small>Denúncias Pendentes</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <MessageSquare size={24} className="text-primary mb-2" />
                <h4>{numTopicos !== null ? numTopicos : "..."}</h4>
                <small>Total Tópicos</small>
              </div>
            </div>
          </div>
        </div>

        {/* Navegação por Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "solicitacoes" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("solicitacoes")}
                >
                  <Clock size={16} className="me-1" />
                  Solicitações ({solicitacoes.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "denuncias" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("denuncias")}
                >
                  <Flag size={16} className="me-1" />
                  Denúncias ({denuncias.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "criar" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("criar")}
                >
                  <Plus size={16} className="me-1" />
                  Criar Tópico
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="row">
          <div className="col-12">
            {/* Tab Solicitações */}
            {activeTab === "solicitacoes" && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Solicitações Pendentes</h5>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-3">
                      <div className="spinner-border" />
                      <p className="mt-2">Carregando solicitações...</p>
                    </div>
                  ) : solicitacoes.length === 0 ? (
                    <div className="text-center py-5">
                      <Clock size={64} className="text-muted mb-3" />
                      <h5 className="text-muted">
                        Nenhuma solicitação pendente
                      </h5>
                      <p className="text-muted">
                        Todas as solicitações foram processadas.
                      </p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Título Sugerido</th>
                            <th>Categoria/Área/Tópico</th>
                            <th>Solicitante</th>
                            <th>Data</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {solicitacoes.map((sol) => (
                            <tr key={sol.ID_FORUM_SOLICITACAO}>
                              <td>
                                <strong>{sol.TITULO_SUGERIDO}</strong>
                                <br />
                                <small className="text-muted">
                                  {sol.JUSTIFICATIVA.length > 100
                                    ? `${sol.JUSTIFICATIVA.substring(
                                        0,
                                        100
                                      )}...`
                                    : sol.JUSTIFICATIVA}
                                </small>
                              </td>
                              <td>
                                <small>
                                  {sol.Categoria?.NOME__} → {sol.AREA?.NOME} →{" "}
                                  {sol.TOPICO?.TITULO}
                                </small>
                              </td>
                              <td>{sol.Solicitante?.NOME}</td>
                              <td>{formatDate(sol.DATA_CRIACAO)}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary me-1"
                                  onClick={() => openRespostaModal(sol)}
                                >
                                  <Eye size={14} className="me-1" />
                                  Analisar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab Denúncias */}
            {activeTab === "denuncias" && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Denúncias Pendentes</h5>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-3">
                      <div className="spinner-border" />
                      <p className="mt-2">Carregando denúncias...</p>
                    </div>
                  ) : denuncias.length === 0 ? (
                    <div className="text-center py-5">
                      <Flag size={64} className="text-muted mb-3" />
                      <h5 className="text-muted">Nenhuma denúncia pendente</h5>
                      <p className="text-muted">
                        Não há denúncias que requerem atenção no momento.
                      </p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Post</th>
                            <th>Motivo</th>
                            <th>Denunciante</th>
                            <th>Data</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {denuncias.map((den) => (
                            <tr key={den.ID_FORUM_DENUNCIA}>
                              <td>
                                <small>
                                  {den.FORUM_POST?.CONTEUDO?.length > 100
                                    ? `${den.FORUM_POST.CONTEUDO.substring(
                                        0,
                                        100
                                      )}...`
                                    : den.FORUM_POST?.CONTEUDO ||
                                      "Post apagado"}
                                </small>
                              </td>
                              <td>
                                <span className="badge bg-warning text-dark">
                                  {den.MOTIVO.replace(/_/g, " ")}
                                </span>
                                {den.DESCRICAO && (
                                  <>
                                    <br />
                                    <small className="text-muted">
                                      {den.DESCRICAO}
                                    </small>
                                  </>
                                )}
                              </td>
                              <td>{den.Denunciante?.NOME}</td>
                              <td>{formatDate(den.DATA_CRIACAO)}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary me-1"
                                  onClick={() =>
                                    navigate(
                                      `/forum/topico/${den.FORUM_POST.FORUM_TOPICO.ID_FORUM_TOPICO}`
                                    )
                                  }
                                  disabled={!den.FORUM_POST?.CONTEUDO}
                                >
                                  <Eye size={14} className="me-1" />
                                  Ver post
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() =>
                                    handleDeleteDenuncia(den.ID_FORUM_DENUNCIA)
                                  }
                                >
                                  <Trash2 size={14} className="me-0" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab Criar Tópico */}
            {activeTab === "criar" && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Criar novo tópico</h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-info">
                    <strong>Informação:</strong> Como gestor, pode criar tópicos
                    diretamente sem necessidade de aprovação. Os tópicos criados
                    ficarão imediatamente disponíveis para discussão.
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus size={16} className="me-1" />
                    Criar novo tópico
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {showCreateModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content" style={{ zIndex: 1051 }}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    <Plus size={20} className="me-2" />
                    Criar Novo Tópico de Fórum
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseCreateModal}
                  />
                </div>

                <form onSubmit={handleCreateTopico}>
                  <div className="modal-body">
                    <div className="alert alert-info">
                      <strong>Informação:</strong> Está a criar um tópico de
                      discussão que ficará imediatamente disponível no fórum
                      para todos os utilizadores.
                    </div>

                    {/* Seleção de Categoria/Área/Tópico */}
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <label className="form-label">Categoria *</label>
                        <select
                          className="form-select"
                          value={novoTopico.categoriaId}
                          onChange={(e) =>
                            setNovoTopico((prev) => ({
                              ...prev,
                              categoriaId: e.target.value,
                              areaId: "",
                              topicoId: "",
                            }))
                          }
                          required
                          disabled={loadingButton}
                        >
                          <option value="">Selecione uma categoria</option>
                          {categorias.map((cat) => (
                            <option
                              key={cat.ID_CATEGORIA__PK___}
                              value={cat.ID_CATEGORIA__PK___}
                            >
                              {cat.NOME__}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Área *</label>
                        <select
                          className="form-select"
                          value={novoTopico.areaId}
                          onChange={(e) =>
                            setNovoTopico((prev) => ({
                              ...prev,
                              areaId: e.target.value,
                              topicoId: "",
                            }))
                          }
                          required
                          disabled={loadingButton || !novoTopico.categoriaId}
                        >
                          <option value="">Selecione uma área</option>
                          {areas.map((area) => (
                            <option key={area.ID_AREA} value={area.ID_AREA}>
                              {area.NOME}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Tópico *</label>
                        <select
                          className="form-select"
                          value={novoTopico.topicoId}
                          onChange={(e) =>
                            setNovoTopico((prev) => ({
                              ...prev,
                              topicoId: e.target.value,
                            }))
                          }
                          required
                          disabled={loadingButton || !novoTopico.areaId}
                        >
                          <option value="">Selecione um tópico</option>
                          {topicos.map((topico) => (
                            <option
                              key={topico.ID_TOPICO}
                              value={topico.ID_TOPICO}
                            >
                              {topico.TITULO}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Título do Tópico de Fórum */}
                    <div className="mb-3">
                      <label className="form-label">
                        Título do Tópico de Discussão *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex: Dúvidas sobre React.js - Discussão Geral"
                        value={novoTopico.titulo}
                        onChange={(e) =>
                          setNovoTopico((prev) => ({
                            ...prev,
                            titulo: e.target.value,
                          }))
                        }
                        required
                        disabled={loadingButton}
                        minLength={5}
                        maxLength={255}
                      />
                      <div className="form-text">
                        {novoTopico.titulo.length}/255 caracteres (mínimo 5)
                      </div>
                    </div>

                    {/* Descrição */}
                    <div className="mb-3">
                      <label className="form-label">Descrição *</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Descreva o propósito deste tópico de discussão..."
                        value={novoTopico.descricao}
                        onChange={(e) =>
                          setNovoTopico((prev) => ({
                            ...prev,
                            descricao: e.target.value,
                          }))
                        }
                        required
                        disabled={loadingButton}
                        minLength={10}
                        maxLength={1000}
                      />
                      <div className="form-text">
                        {novoTopico.descricao.length}/1000 caracteres (mínimo
                        10)
                      </div>
                    </div>

                    {/* Preview da hierarquia */}
                    {novoTopico.categoriaId &&
                      novoTopico.areaId &&
                      novoTopico.topicoId && (
                        <div className="alert alert-secondary">
                          <h6 className="mb-2">Preview da localização:</h6>
                          <small className="text-muted">
                            <strong>Categoria:</strong>{" "}
                            {
                              categorias.find(
                                (c) =>
                                  c.ID_CATEGORIA__PK___ ==
                                  novoTopico.categoriaId
                              )?.NOME__
                            }
                            {" → "}
                            <strong>Área:</strong>{" "}
                            {
                              areas.find((a) => a.ID_AREA == novoTopico.areaId)
                                ?.NOME
                            }
                            {" → "}
                            <strong>Tópico:</strong>{" "}
                            {
                              topicos.find(
                                (t) => t.ID_TOPICO == novoTopico.topicoId
                              )?.TITULO
                            }
                            {" → "}
                            <strong>Discussão:</strong>{" "}
                            {novoTopico.titulo || "Título do tópico"}
                          </small>
                        </div>
                      )}
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseCreateModal}
                      disabled={loadingButton}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        loadingButton ||
                        !novoTopico.categoriaId ||
                        !novoTopico.areaId ||
                        !novoTopico.topicoId ||
                        !novoTopico.titulo.trim() ||
                        !novoTopico.descricao.trim() ||
                        novoTopico.titulo.length < 5 ||
                        novoTopico.descricao.length < 10
                      }
                    >
                      {loadingButton ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          A criar...
                        </>
                      ) : (
                        <>
                          <Plus size={16} className="me-1" />
                          Criar Tópico
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div
              className="modal-backdrop show"
              style={{ zIndex: 1050 }}
              onClick={handleCloseCreateModal}
            />
          </div>
        )}

        {/* Modal Resposta Solicitação */}
        {showRespostaModal && solicitacaoSelecionada && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content" style={{ zIndex: 1051 }}>
                <div className="modal-header">
                  <h5 className="modal-title">Analisar Solicitação</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowRespostaModal(false)}
                  />
                </div>
                <div className="modal-body">
                  {/* Detalhes da Solicitação */}
                  <div className="mb-4">
                    <h6>Detalhes da Solicitação</h6>
                    <div className="bg-light p-3 rounded">
                      <p className="mb-1">
                        <strong>Título:</strong>{" "}
                        {solicitacaoSelecionada.TITULO_SUGERIDO}
                      </p>
                      <p className="mb-1">
                        <strong>Categoria:</strong>{" "}
                        {solicitacaoSelecionada.Categoria?.NOME__} →{" "}
                        {solicitacaoSelecionada.AREA?.NOME} →{" "}
                        {solicitacaoSelecionada.TOPICO?.TITULO}
                      </p>
                      <p className="mb-1">
                        <strong>Justificativa:</strong>{" "}
                        {solicitacaoSelecionada.JUSTIFICATIVA}
                      </p>
                      <p className="mb-0">
                        <strong>Solicitante:</strong>{" "}
                        {solicitacaoSelecionada.Solicitante?.NOME}
                      </p>
                    </div>
                  </div>

                  {/* Decisão */}
                  <div className="mb-3">
                    <label className="form-label">Decisão *</label>
                    <select
                      className="form-select"
                      value={respostaData.decisao}
                      onChange={(e) =>
                        setRespostaData((prev) => ({
                          ...prev,
                          decisao: e.target.value,
                        }))
                      }
                    >
                      <option value="">Selecione uma decisão</option>
                      <option value="Aprovado">Aprovar</option>
                      <option value="Rejeitado">Rejeitar</option>
                    </select>
                  </div>

                  {/* Resposta */}
                  <div className="mb-3">
                    <label className="form-label">
                      Resposta ao Solicitante
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Explique a decisão tomada..."
                      value={respostaData.resposta}
                      onChange={(e) =>
                        setRespostaData((prev) => ({
                          ...prev,
                          resposta: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Dados do Tópico (se aprovado) */}
                  {respostaData.decisao === "Aprovado" && (
                    <div className="border-top pt-3">
                      <h6>Dados do Tópico</h6>
                      <div className="mb-3">
                        <label className="form-label">Título do Tópico</label>
                        <input
                          type="text"
                          className="form-control"
                          value={respostaData.dadosTopico.titulo}
                          onChange={(e) =>
                            setRespostaData((prev) => ({
                              ...prev,
                              dadosTopico: {
                                ...prev.dadosTopico,
                                titulo: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          Descrição do Tópico
                        </label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={respostaData.dadosTopico.descricao}
                          onChange={(e) =>
                            setRespostaData((prev) => ({
                              ...prev,
                              dadosTopico: {
                                ...prev.dadosTopico,
                                descricao: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowRespostaModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleResponderSolicitacao}
                    disabled={!respostaData.decisao || loadingButton}
                  >
                    {loadingButton ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <>
                        <CheckCircle size={16} className="me-1" />
                        Confirmar Decisão
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div
              className="modal-backdrop show"
              style={{ zIndex: 1050 }}
              onClick={() => setShowRespostaModal(false)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ForumAdmin;
