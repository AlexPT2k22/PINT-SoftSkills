import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./navbar.jsx";
import {
  Shield,
  MessageSquare,
  Plus,
  CheckCircle,
  X,
  Flag,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  ChevronLeft,
  Eye,
  Search,
} from "lucide-react";

const URL =
  import.meta.env.PROD === "production"
    ? "https://pint-softskills-api.onrender.com"
    : "http://localhost:4000";

const ForumAdmin = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("solicitacoes");
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para criação de tópico
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

  // Estados para resposta de solicitação
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
    if (activeTab === "solicitacoes") {
      fetchSolicitacoes();
    } else if (activeTab === "denuncias") {
      fetchDenuncias();
    }
  }, [activeTab]);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${URL}/api/categories`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setCategorias(response.data.categories);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
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
      setError("Erro ao carregar solicitações");
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
      setError("Erro ao carregar denúncias");
    } finally {
      setLoading(false);
    }
  };

  const handleResponderSolicitacao = async () => {
    try {
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
        alert("Solicitação respondida com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao responder solicitação:", error);
      alert("Erro ao responder solicitação");
    }
  };

  const handleCreateTopico = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${URL}/api/forum/topicos`,
        novoTopico,
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
        alert("Tópico criado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao criar tópico:", error);
      alert("Erro ao criar tópico");
    }
  };

  const openRespostaModal = (solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setRespostaData({
      decisao: "",
      resposta: "",
      dadosTopico: {
        titulo: solicitacao.TITULO_SUGERIDO,
        descricao: `Tópico criado a partir da solicitação: ${solicitacao.JUSTIFICATIVA}`,
      },
    });
    setShowRespostaModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("pt-PT");
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <button
            className="btn btn-outline-secondary mb-3"
            onClick={() => navigate("/forum")}
          >
            <ChevronLeft size={16} className="me-1" />
            Voltar ao Fórum
          </button>

          <h2 className="mb-1">
            <Shield size={32} className="me-2" />
            Painel Administrativo do Fórum
          </h2>
          <p className="text-muted mb-0">
            Gerir solicitações de tópicos, denúncias e criar novos tópicos.
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <Clock size={24} className="text-warning mb-2" />
              <h4>{solicitacoes.length}</h4>
              <small>Solicitações Pendentes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <Flag size={24} className="text-danger mb-2" />
              <h4>{denuncias.length}</h4>
              <small>Denúncias Pendentes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <MessageSquare size={24} className="text-primary mb-2" />
              <h4>--</h4>
              <small>Total Tópicos</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <Users size={24} className="text-success mb-2" />
              <h4>--</h4>
              <small>Usuários Ativos</small>
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
                className={`nav-link ${activeTab === "criar" ? "active" : ""}`}
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
                  </div>
                ) : solicitacoes.length === 0 ? (
                  <div className="text-center py-5">
                    <Clock size={64} className="text-muted mb-3" />
                    <h5 className="text-muted">Nenhuma solicitação pendente</h5>
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
                                {sol.JUSTIFICATIVA.substring(0, 100)}...
                              </small>
                            </td>
                            <td>
                              <small>
                                {sol.Categoria?.NOME__} → {sol.Area?.NOME} →{" "}
                                {sol.Topico?.TITULO}
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
                  </div>
                ) : denuncias.length === 0 ? (
                  <div className="text-center py-5">
                    <Flag size={64} className="text-muted mb-3" />
                    <h5 className="text-muted">Nenhuma denúncia pendente</h5>
                  </div>
                ) : (
                  <>
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
                                  {den.ForumPost?.CONTEUDO?.substring(0, 100)}
                                  ...
                                </small>
                              </td>
                              <td>
                                <span className="badge bg-warning">
                                  {den.MOTIVO}
                                </span>
                                {den.DESCRICAO && (
                                  <small>{den.DESCRICAO}</small>
                                )}
                              </td>
                              <td>{den.Denunciante?.NOME}</td>
                              <td>{formatDate(den.DATA_CRIACAO)}</td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary me-1">
                                  <Eye size={14} className="me-1" />
                                  Ver Post
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tab Criar Tópico */}
          {activeTab === "criar" && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Criar Novo Tópico</h5>
              </div>
              <div className="card-body">
                <p className="text-muted">
                  Como gestor, pode criar tópicos diretamente sem necessidade de
                  aprovação.
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={16} className="me-1" />
                  Criar Novo Tópico
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Resposta Solicitação */}
      {showRespostaModal && solicitacaoSelecionada && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
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
                  <p>
                    <strong>Título:</strong>{" "}
                    {solicitacaoSelecionada.TITULO_SUGERIDO}
                  </p>
                  <p>
                    <strong>Categoria:</strong>{" "}
                    {solicitacaoSelecionada.Categoria?.NOME__} →{" "}
                    {solicitacaoSelecionada.Area?.NOME} →{" "}
                    {solicitacaoSelecionada.Topico?.TITULO}
                  </p>
                  <p>
                    <strong>Justificativa:</strong>{" "}
                    {solicitacaoSelecionada.JUSTIFICATIVA}
                  </p>
                  <p>
                    <strong>Solicitante:</strong>{" "}
                    {solicitacaoSelecionada.Solicitante?.NOME}
                  </p>
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
                  <label className="form-label">Resposta ao Solicitante</label>
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
                      <label className="form-label">Descrição do Tópico</label>
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
                  disabled={!respostaData.decisao}
                >
                  Confirmar Decisão
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" />
        </div>
      )}
    </div>
  );
};

export default ForumAdmin;
